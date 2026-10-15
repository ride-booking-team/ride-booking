import { describe, it, expect } from "vitest";
import { CryptoIdGenerator } from "../src/infra/crypto-id-generator.provider.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("CryptoIdGenerator", () => {
    it("should generate a UUID", () => {
        expect(new CryptoIdGenerator().generate()).toMatch(UUID);
    });

    it("should never generate the same id twice", () => {
        const generator = new CryptoIdGenerator();

        const ids = new Set(Array.from({ length: 100 }, () => generator.generate()));

        expect(ids.size).toBe(100);
    });
});
