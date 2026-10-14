import { describe, it, expect, beforeEach } from "vitest";
import type { Rider } from "../src/rider.js";
import { BookingBuilder } from "./builders/booking.builder.js";
import { RiderBuilder } from "./builders/rider.builder.js";
import { CalculatePriceUsecase } from "../src/calculate-price.usecase.js";
import type { Ride } from "../src/ride.js";

describe("CalculatePriceUsecase", () => {
    let calculPriceUsecase: CalculatePriceUsecase;
    let bookRideUseCase: BookRideUseCase;

    beforeEach(() => {
        calculPriceUsecase = new CalculatePriceUsecase();
        bookRideUseCase = new BookRideUseCase(calculPriceUsecase);
    });

    const bookingHighBalance = new BookingBuilder().build();
    const bookingLowBalance = new BookingBuilder()
        .withRider(new RiderBuilder().withBalance(1).build())
        .build();
    const failedBooking = new BookingBuilder().withPendingBooking(true).build();

       


    it("should not be able to book a ride (low balance)", () => {
        const bookstatus = bookRideUseCase.execute(bookingLowBalance);
        expect(bookstatus).toBe(false);
    });

    it("should be able to book a ride (higher balance)", () => {
        const bookstatus = bookRideUseCase.execute(bookingHighBalance);
        expect(bookstatus).toBe(true);
    });

    it("should reject booking when the rider has an unassigned active reservation", () => {
        const bookstatus = bookRideUseCase.execute(failedBooking);

        expect(bookstatus).toBe(false);
    })

});

export type Booking = {
    ride: Ride,
    rider: Rider,
    hasPendingBooking?: boolean,
}

export class BookRideUseCase {
    constructor(
        private readonly calculatePrice: CalculatePriceUsecase,
    ){}

    execute(booking: Booking): boolean {
        const ridePrice = this.calculatePrice.execute(booking.ride)

        if(booking.hasPendingBooking) return false;
        return booking.rider.balance >= ridePrice;
    }
}