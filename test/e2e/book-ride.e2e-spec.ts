import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";

import { resetDB } from "../../setup-integration-tests/docker-postgresql-manager.js";
import { startTestApp, stopTestApp, type TestApp } from "./test-app.js";

const FROM = "10 rue de Rivoli";
const TO = "5 avenue Foch";

describe("POST /rides/book", () => {
    let testApp: TestApp;

    beforeAll(async () => {
        testApp = await startTestApp();
    });

    beforeEach(async () => {
        await resetDB(testApp.knex);

        // Paris -> Paris, 10 km : 2 € + 10 × 0,5 € = 7 € (l'horloge stub est hors heure de pointe).
        testApp.routeScanner.withRoute(FROM, TO, {
            departureCity: "Paris",
            destinationCity: "Paris",
            distanceKm: 10,
        });
    });

    afterAll(async () => {
        await stopTestApp(testApp);
    });

    async function aRider(balance: number): Promise<void> {
        await testApp.knex("riders").insert({
            id: "rider-1",
            balance,
            birth_date: "2000-01-01",
        });
    }

    function book(body: object) {
        return request(testApp.app).post("/rides/book").send(body);
    }

    it("should book the ride and save it with its price", async () => {
        await aRider(7);

        const response = await book({ riderId: "rider-1", from: FROM, to: TO });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ id: expect.any(String) });

        const saved = await testApp.knex("bookings").where({ id: response.body.id }).first();
        expect(saved).toMatchObject({
            rider_id: "rider-1",
            status: "pending",
            departure: "Paris",
            destination: "Paris",
        });
        expect(Number(saved.price)).toBe(7);
    });

    it.each([
        ["riderId", { from: FROM, to: TO }],
        ["from", { riderId: "rider-1", to: TO }],
        ["to", { riderId: "rider-1", from: FROM }],
    ])("should answer 400 without '%s'", async (_missing, body) => {
        await aRider(100);

        const response = await book(body);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: expect.any(String) });
    });

    it("should answer 400 for a body that is not valid JSON", async () => {
        const response = await request(testApp.app)
            .post("/rides/book")
            .set("Content-Type", "application/json")
            .send("{ not json");

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: expect.any(String) });
    });

    it("should answer 404 for an unknown rider", async () => {
        const response = await book({ riderId: "unknown", from: FROM, to: TO });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: "rider not found: unknown" });
    });

    it("should answer 422 for an address that cannot be found", async () => {
        await aRider(100);

        const response = await book({ riderId: "rider-1", from: "nowhere", to: TO });

        expect(response.status).toBe(422);
        expect(response.body).toEqual({ error: "address not found: nowhere" });
    });

    it("should answer 402 when the rider cannot pay the ride", async () => {
        await aRider(6);

        const response = await book({ riderId: "rider-1", from: FROM, to: TO });

        expect(response.status).toBe(402);
        expect(response.body).toEqual({ error: "rider rider-1 cannot pay 7" });
    });

    it("should answer 409 while another booking is waiting for a driver", async () => {
        await aRider(100);
        await book({ riderId: "rider-1", from: FROM, to: TO }).expect(201);

        const response = await book({ riderId: "rider-1", from: FROM, to: TO });

        expect(response.status).toBe(409);
        expect(response.body).toEqual({
            error: "rider rider-1 already has a booking waiting for a driver",
        });
    });
});
