import { describe, it, expect } from "vitest";
import { RiderBuilder } from "./builders/rider.builder.js";
import { BookingBuilder } from "./builders/booking.builder.js";
import { InsufficientFundsError } from "../src/domain/errors/insufficient-funds-error.js";
import { PendingBookingError } from "../src/domain/errors/pending-booking-error.js";

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

    it("a rider can block a driver", () => {
        const rider = new RiderBuilder().build();

        rider.blockDriver("driver-1");

        expect(rider.hasBlocked("driver-1")).toBe(true);
    });

    it("a rider can block up to 3 drivers, the 4th is refused", () => {
        const rider = new RiderBuilder().build();
        rider.blockDriver("driver-1");
        rider.blockDriver("driver-2");
        rider.blockDriver("driver-3");

        expect(() => rider.blockDriver("driver-4")).toThrow(/more than 3 drivers/);
        expect(rider.hasBlocked("driver-4")).toBe(false);
    });

    it("blocking the same driver twice only counts once", () => {
        const rider = new RiderBuilder().build();
        rider.blockDriver("driver-1");
        rider.blockDriver("driver-1");
        rider.blockDriver("driver-2");

        expect(() => rider.blockDriver("driver-3")).not.toThrow();
    });

    it("a rider can unblock a driver, which frees a place in the list", () => {
        const rider = new RiderBuilder().build();
        rider.blockDriver("driver-1");
        rider.blockDriver("driver-2");
        rider.blockDriver("driver-3");

        rider.unblockDriver("driver-1");

        expect(rider.hasBlocked("driver-1")).toBe(false);
        expect(() => rider.blockDriver("driver-4")).not.toThrow();
    });

    it("nobody changes the blocked drivers behind the rider's back", () => {
        const rider = new RiderBuilder().build();
        rider.blockDriver("driver-1");

        (rider.blockedDriverIds as string[]).push("driver-2");

        expect(rider.blockedDriverIds).toEqual(["driver-1"]);
        expect(rider.hasBlocked("driver-2")).toBe(false);
    });

    it("a rider can book a ride they can pay, with no booking waiting for a driver", () => {
        const rider = new RiderBuilder().withBalance(10).build();
        const withDriver = new BookingBuilder().withStatus("assigned").withDriverId("driver-1").build();

        expect(() => rider.ensureCanBook(10, [withDriver])).not.toThrow();
    });

    it("a rider cannot book a ride they cannot pay", () => {
        const rider = new RiderBuilder().withBalance(9).build();

        expect(() => rider.ensureCanBook(10, [])).toThrow(InsufficientFundsError);
    });

    it("a rider cannot book while a booking is waiting for a driver", () => {
        const rider = new RiderBuilder().withBalance(10).build();
        const waiting = new BookingBuilder().withStatus("pending").build();

        expect(() => rider.ensureCanBook(2, [waiting])).toThrow(PendingBookingError);
    });
});