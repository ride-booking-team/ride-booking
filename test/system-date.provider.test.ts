import { describe, it, expect } from "vitest";
import { SystemDateProvider } from "../src/infra/system-date.provider.js";

describe("SystemDateProvider", () => {
    it("should give the current date", () => {
        const before = Date.now();

        const now = new SystemDateProvider().now();

        expect(now.getTime()).toBeGreaterThanOrEqual(before);
        expect(now.getTime()).toBeLessThanOrEqual(Date.now());
    });
});
