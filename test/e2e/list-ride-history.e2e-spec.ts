import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";

import { resetDB } from "../../setup-integration-tests/docker-postgresql-manager.js";
import { startTestApp, stopTestApp, type TestApp } from "./test-app.js";

const FROM = "10 rue de Rivoli";
const TO = "Place Bellecour";

describe("GET /riders/:riderId/rides", () => {
    let testApp: TestApp;

    beforeAll(async () => {
        testApp = await startTestApp();
    });

    beforeEach(async () => {
        await resetDB(testApp.knex);

        testApp.routeScanner.withRoute(FROM, TO, {
            departureCity: "Paris",
            destinationCity: "Lyon",
            distanceKm: 460,
        });
        await testApp.knex("riders").insert({ id: "rider-1", balance: 1000, birth_date: "2000-01-01" });
    });

    afterAll(async () => {
        await stopTestApp(testApp);
    });

    async function aBooking(): Promise<string> {
        const response = await request(testApp.app)
            .post("/rides/book")
            .send({ riderId: "rider-1", from: FROM, to: TO })
            .expect(201);

        return response.body.id;
    }

    // Aucun endpoint n'assigne de driver : on le fait directement en base.
    async function assignAlice(bookingId: string): Promise<void> {
        await testApp.knex("drivers").insert({ id: "driver-1", name: "Alice", available: false });
        await testApp.knex("bookings")
            .where({ id: bookingId })
            .update({ driver_id: "driver-1", status: "assigned" });
    }

    function historyOf(riderId: string) {
        return request(testApp.app).get(`/riders/${riderId}/rides`);
    }

    it("should list every ride of the rider with its driver", async () => {
        const withDriver = await aBooking();
        await assignAlice(withDriver);
        const waiting = await aBooking();

        const response = await historyOf("rider-1");

        expect(response.status).toBe(200);
        expect(response.body.totalRides).toBe(2);
        expect(response.body.rides).toEqual(
            expect.arrayContaining([
                {
                    bookingId: withDriver,
                    departure: "Paris",
                    destination: "Lyon",
                    distanceKm: 460,
                    status: "assigned",
                    driver: { id: "driver-1", name: "Alice" },
                },
                {
                    bookingId: waiting,
                    departure: "Paris",
                    destination: "Lyon",
                    distanceKm: 460,
                    status: "pending",
                    driver: null,
                },
            ]),
        );
    });

    it("should not list the rides of another rider", async () => {
        await aBooking();
        await testApp.knex("riders").insert({ id: "rider-2", balance: 1000, birth_date: "2000-01-01" });

        const response = await historyOf("rider-2");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ totalRides: 0, rides: [] });
    });
});
