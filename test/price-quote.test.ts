import { describe, it, expect } from "vitest";
import { PriceQuote } from "../src/domain/models/price-quote.js";
import { RideBuilder } from "./builders/ride.builder.js";

describe("PriceQuote", () => {
    it("expires 5 minutes after it was made", () => {
        const quote = PriceQuote.create({
            token: "token-1",
            riderId: "rider-1",
            ride: new RideBuilder().build(),
            uberX: false,
            price: 7,
            now: new Date("2026-10-15T10:00:00Z"),
        });

        expect(quote.isExpired(new Date("2026-10-15T10:04:59Z"))).toBe(false);
        expect(quote.isExpired(new Date("2026-10-15T10:05:00Z"))).toBe(true);
    });
});