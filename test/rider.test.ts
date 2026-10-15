import { describe, it, expect } from "vitest";
import { RiderBuilder } from "./builders/rider.builder.js";

describe("Rider", () => {
    it("it is the rider's birthday on the same day and month, whatever the year", () => {
        const rider = new RiderBuilder()
            .withBirthDate(new Date("2000-10-14"))
            .build();

        expect(rider.isBirthday(new Date("2026-10-14"))).toBe(true);
        expect(rider.isBirthday(new Date("2026-10-15"))).toBe(false);
        expect(rider.isBirthday(new Date("2026-11-14"))).toBe(false);
    });

    it("paying takes the amount from the balance", () => {
        const rider = new RiderBuilder().withBalance(10).build();

        rider.pay(5);

        expect(rider.balance).toBe(5);
    });
});