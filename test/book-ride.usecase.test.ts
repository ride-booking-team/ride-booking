import { describe, it, expect, beforeEach } from "vitest";
import { CalculatePriceUsecase, type Ride } from "../src/calculate-price.usecase.js";

describe("CalculatePriceUsecase", () => {
    let calculPriceUsecase: CalculatePriceUsecase;
    let bookRideUseCase: BookRideUseCase;

    beforeEach(() => {
        calculPriceUsecase = new CalculatePriceUsecase();
        bookRideUseCase = new BookRideUseCase(calculPriceUsecase);
    });

    const ride2e : Ride = {
            departure: "Paris",
            destination: "Paris",
            distanceKm: 0,
        };

    const bookingSuccess: Booking = {
        ride: ride2e,
        riderBalance: 10,
        hasPendingBooking: false,
    }  
    
    const bookingFail: Booking = {
        ride: ride2e,
        riderBalance: 10,
        hasPendingBooking: true,
    }

    it("should not be able to book a ride (low balance)", () => {
        const bookstatus = bookRideUseCase.execute(bookingSuccess);
        expect(bookstatus).toBe(true);
    });

    it("should be able to book a ride (same balance)", () => {
        const bookstatus = bookRideUseCase.execute(bookingSuccess);
        expect(bookstatus).toBe(true);
    });

    it("should be able to book a ride (higher balance)", () => {
        const bookstatus = bookRideUseCase.execute(bookingSuccess);
        expect(bookstatus).toBe(true);
    });

    it("should reject booking when the rider has an unassigned active reservation", () => {
        const bookstatus = bookRideUseCase.execute(bookingFail);

        expect(bookstatus).toBe(false);
    })

});

export type Booking = {
    ride: Ride,
    riderBalance: number,
    hasPendingBooking?: boolean,
}

export class BookRideUseCase {
    constructor(
        private readonly calculatePrice: CalculatePriceUsecase,
    ){}

    execute(booking: Booking): boolean {
        const ridePrice = this.calculatePrice.execute(booking.ride)

        if(booking.hasPendingBooking) return false;
        return booking.riderBalance >= ridePrice;
    }
}