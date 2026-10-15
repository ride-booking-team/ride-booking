import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";

import { resetDB } from "../../setup-integration-tests/docker-postgresql-manager.js";
import { startTestApp, stopTestApp, type TestApp } from "./test-app.js";

const FROM = "10 rue de Rivoli";
const TO = "5 avenue Foch";

describe("POST /rides/estimate", () => {
    let testApp: TestApp;

    beforeAll(async () => {
        testApp = await startTestApp();
    });

    beforeEach(async () => {
        await resetDB(testApp.knex);

        // 12h à Paris : ni heure de pointe, ni Noël.
        testApp.dateProvider.date = new Date("2026-10-15T10:00:00Z");
        // Paris -> Paris, 10 km : 2 € + 10 × 0,5 € = 7 €.
        testApp.routeScanner.withRoute(FROM, TO, {
            departureCity: "Paris",
            destinationCity: "Paris",
            distanceKm: 10,
        });
        await testApp.knex("riders").insert({ id: "rider-1", balance: 100, birth_date: "2000-01-01" });
    });

    afterAll(async () => {
        await stopTestApp(testApp);
    });

    function estimate(body: object) {
        return request(testApp.app).post("/rides/estimate").send(body);
    }

    it("should give the price, a token and when it expires", async () => {
        const response = await estimate({ riderId: "rider-1", from: FROM, to: TO });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            token: expect.any(String),
            price: 7,
            expiresAt: "2026-10-15T10:05:00.000Z",
        });
    });

    it("should include the UberX supplement", async () => {
        const response = await estimate({ riderId: "rider-1", from: FROM, to: TO, uberX: true });

        expect(response.status).toBe(200);
        expect(response.body.price).toBe(12);
    });

    it("should not create any ride or booking", async () => {
        await estimate({ riderId: "rider-1", from: FROM, to: TO }).expect(200);

        expect(await testApp.knex("bookings").count({ total: "*" })).toEqual([{ total: "0" }]);
        expect(await testApp.knex("rides").count({ total: "*" })).toEqual([{ total: "0" }]);
    });

    it.each([
        ["riderId", { from: FROM, to: TO }],
        ["from", { riderId: "rider-1", to: TO }],
        ["to", { riderId: "rider-1", from: FROM }],
    ])("should answer 400 without '%s'", async (_missing, body) => {
        const response = await estimate(body);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: expect.any(String) });
    });

    it("should answer 404 for an unknown rider", async () => {
        const response = await estimate({ riderId: "unknown", from: FROM, to: TO });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: "rider not found: unknown" });
    });
});
