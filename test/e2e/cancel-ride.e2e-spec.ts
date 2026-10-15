import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";

import { resetDB } from "../../setup-integration-tests/docker-postgresql-manager.js";
import { startTestApp, stopTestApp, type TestApp } from "./test-app.js";

const FROM = "10 rue de Rivoli";
const TO = "5 avenue Foch";

describe("POST /rides/:bookingId/cancel", () => {
    let testApp: TestApp;

    beforeAll(async () => {
        testApp = await startTestApp();
    });

    beforeEach(async () => {
        await resetDB(testApp.knex);

        // L'horloge stub est au 14 octobre 2026.
        testApp.dateProvider.date = new Date("2026-10-14");
        testApp.routeScanner.withRoute(FROM, TO, {
            departureCity: "Paris",
            destinationCity: "Paris",
            distanceKm: 10,
        });
    });

    afterAll(async () => {
        await stopTestApp(testApp);
    });

    async function aRider({ birthDate = "2000-01-01" } = {}): Promise<void> {
        await testApp.knex("riders").insert({
            id: "rider-1",
            balance: 100,
            birth_date: birthDate,
        });
    }

    async function aBooking(): Promise<string> {
        const response = await request(testApp.app)
            .post("/rides/book")
            .send({ riderId: "rider-1", from: FROM, to: TO })
            .expect(201);

        return response.body.id;
    }

    // Aucun endpoint n'assigne de driver : on met la réservation dans cet état directement en base.
    async function driverOnTheWay(bookingId: string): Promise<void> {
        await testApp.knex("drivers").insert({ id: "driver-1", name: "Alice", available: false });
        await testApp.knex("bookings")
            .where({ id: bookingId })
            .update({ driver_id: "driver-1", status: "on_the_way" });
    }

    function cancel(bookingId: string) {
        return request(testApp.app).post(`/rides/${bookingId}/cancel`);
    }

    async function balanceOfRider(): Promise<number> {
        const rider = await testApp.knex("riders").where({ id: "rider-1" }).first();
        return Number(rider.balance);
    }

    async function statusOf(bookingId: string): Promise<string> {
        const booking = await testApp.knex("bookings").where({ id: bookingId }).first();
        return booking.status;
    }

    it("should cancel a booking waiting for a driver for free", async () => {
        await aRider();
        const bookingId = await aBooking();

        const response = await cancel(bookingId);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ penalty: 0 });
        expect(await statusOf(bookingId)).toBe("cancelled");
        expect(await balanceOfRider()).toBe(100);
    });

    it("should charge 5 euros when the driver is on the way", async () => {
        await aRider();
        const bookingId = await aBooking();
        await driverOnTheWay(bookingId);

        const response = await cancel(bookingId);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ penalty: 5 });
        expect(await statusOf(bookingId)).toBe("cancelled");
        expect(await balanceOfRider()).toBe(95);
    });

    it("should not charge anything on the rider's birthday, even with the driver on the way", async () => {
        await aRider({ birthDate: "2000-10-14" });
        const bookingId = await aBooking();
        await driverOnTheWay(bookingId);

        const response = await cancel(bookingId);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ penalty: 0 });
        expect(await balanceOfRider()).toBe(100);
    });

    it("should answer 404 for an unknown booking", async () => {
        const response = await cancel("unknown");

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: "booking not found: unknown" });
    });

    it("should answer 409 for a booking already cancelled", async () => {
        await aRider();
        const bookingId = await aBooking();
        await cancel(bookingId).expect(200);

        const response = await cancel(bookingId);

        expect(response.status).toBe(409);
        expect(response.body).toEqual({ error: `booking already cancelled: ${bookingId}` });
    });
});
