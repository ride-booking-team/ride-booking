import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";

import { startTestApp, stopTestApp, type TestApp } from "./test-app.js";

describe("API", () => {
    let testApp: TestApp;

    beforeAll(async () => {
        testApp = await startTestApp();
    });

    afterAll(async () => {
        await stopTestApp(testApp);
    });

    it("should answer 404 with a JSON error for an unknown route", async () => {
        const response = await request(testApp.app).get("/nowhere");

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: "route not found" });
    });
});
