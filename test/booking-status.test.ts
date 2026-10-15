import { describe, it, expect } from "vitest";
import { BookingStatus } from "../src/domain/value-objects/booking-status.js";

describe("BookingStatus", () => {
    it("accepts a valid booking status", () => {
        expect(BookingStatus.of("pending").toString()).toBe("pending");
        expect(BookingStatus.of("on_the_way").toString()).toBe("on_the_way");
    });

    it("refuses an invalid booking status", () => {
        expect(() => BookingStatus.of("toto")).toThrow(/invalid booking status/);
    });

    it("two statuses with the same value are equal", () => {
        expect(BookingStatus.of("cancelled").equals(BookingStatus.CANCELLED)).toBe(true);
        expect(BookingStatus.of("pending").equals(BookingStatus.CANCELLED)).toBe(false);
    });
});
