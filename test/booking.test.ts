import { describe, it, expect } from "vitest";
import { BookingStatus } from "../src/domain/value-objects/booking-status.js";
import { BookingBuilder } from "./builders/booking.builder.js";

describe("Booking", () => {
    it("cancelling a pending booking costs nothing", () => {
        const booking = new BookingBuilder().withStatus("pending").build();

        const penalty = booking.cancel({ riderBirthday: false });

        expect(penalty).toBe(0);
        expect(booking.status).toEqual(BookingStatus.CANCELLED);
    });

    it("cancelling while the driver is on the way costs 5 euros", () => {
        const booking = new BookingBuilder()
            .withStatus("on_the_way")
            .withDriverId("driver-1")
            .build();

        const penalty = booking.cancel({ riderBirthday: false });

        expect(penalty).toBe(5);
        expect(booking.status).toEqual(BookingStatus.CANCELLED);
    });

    it("cancelling on the rider's birthday costs nothing, even if the driver is on the way", () => {
        const booking = new BookingBuilder()
            .withStatus("on_the_way")
            .withDriverId("driver-1")
            .build();

        expect(booking.cancel({ riderBirthday: true })).toBe(0);
    });

    it("a cancelled booking cannot be cancelled again, and does not change", () => {
        const booking = new BookingBuilder().withStatus("cancelled").build();

        expect(() => booking.cancel({ riderBirthday: false })).toThrow(
            /already cancelled/,
        );
        expect(booking.status).toEqual(BookingStatus.CANCELLED);
    });

    it("a pending booking without a driver is waiting for one", () => {
        expect(
            new BookingBuilder().withStatus("pending").build().isWaitingForDriver(),
        ).toBe(true);
        expect(
            new BookingBuilder()
                .withStatus("pending")
                .withDriverId("driver-1")
                .build()
                .isWaitingForDriver(),
        ).toBe(false);
        expect(
            new BookingBuilder().withStatus("cancelled").build().isWaitingForDriver(),
        ).toBe(false);
    });

    it("nobody changes the ride behind the booking's back", () => {
        const ride = { id: "ride-1", departure: "Paris", destination: "Lyon", distanceKm: 460 };
        const booking = new BookingBuilder().withRide(ride).build();

        ride.distanceKm = 1;

        expect(booking.ride.distanceKm).toBe(460);
    });

    it("a driver can be assigned to a pending booking", () => {
        const booking = new BookingBuilder().withStatus("pending").build();

        booking.assignDriver("driver-1");

        expect(booking.driverId).toBe("driver-1");
        expect(booking.status).toEqual(BookingStatus.ASSIGNED);
    });

    it("a driver cannot be assigned to a cancelled booking, and the booking does not change", () => {
        const booking = new BookingBuilder().withStatus("cancelled").build();

        expect(() => booking.assignDriver("driver-1")).toThrow(/cancelled/);
        expect(booking.driverId).toBeUndefined();
        expect(booking.status).toEqual(BookingStatus.CANCELLED);
    });
});