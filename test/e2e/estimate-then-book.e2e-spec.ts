import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";

import { resetDB } from "../../setup-integration-tests/docker-postgresql-manager.js";
import { startTestApp, stopTestApp, type TestApp } from "./test-app.js";

const FROM = "10 rue de Rivoli";
const TO = "Place Bellecour";

// Paris est en UTC+2 le 15 octobre.
const AT_7_57_IN_PARIS = new Date("2026-10-15T05:57:00Z");
const AT_8_01_IN_PARIS = new Date("2026-10-15T06:01:00Z");

describe("POST /rides/estimate then POST /rides/book with the token", () => {
    let testApp: TestApp;

    beforeAll(async () => {
        testApp = await startTestApp();
    });

    beforeEach(async () => {
        await resetDB(testApp.knex);

        testApp.dateProvider.date = AT_7_57_IN_PARIS;
        // Paris -> Lyon, 460 km : 10 € + 460 × 0,5 € = 240 € (hors heure de pointe).
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

    async function anEstimate(): Promise<{ token: string; price: number }> {
        const response = await request(testApp.app)
            .post("/rides/estimate")
            .send({ riderId: "rider-1", from: FROM, to: TO })
            .expect(200);

        return response.body;
    }

    function bookWith(token: string) {
        return request(testApp.app).post("/rides/book").send({ riderId: "rider-1", token });
    }

    async function savedBooking(id: string) {
        return testApp.knex("bookings").where({ id }).first();
    }

    it("should book the estimated ride with the token", async () => {
        const { token, price } = await anEstimate();

        const response = await bookWith(token);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ id: expect.any(String) });

        const booking = await savedBooking(response.body.id);
        expect(booking).toMatchObject({
            rider_id: "rider-1",
            status: "pending",
            departure: "Paris",
            destination: "Lyon",
        });
        expect(Number(booking.price)).toBe(price);
    });

    it("should keep the estimated price even when rush hour starts before booking", async () => {
        const { token, price } = await anEstimate();
        expect(price).toBe(240);

        testApp.dateProvider.date = AT_8_01_IN_PARIS;
        // Preuve que le prix a bien changé entre-temps : une nouvelle estimation coûte +50 %.
        expect((await anEstimate()).price).toBe(360);

        const response = await bookWith(token);

        expect(response.status).toBe(201);
        expect(Number((await savedBooking(response.body.id)).price)).toBe(240);
    });
});
