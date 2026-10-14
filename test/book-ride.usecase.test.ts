import { describe, it, expect, beforeEach } from "vitest";
import { BookingBuilder } from "./builders/booking.builder.js";
import { RiderBuilder } from "./builders/rider.builder.js";
import { CalculatePriceUsecase } from "../src/calculate-price.usecase.js";
import { BookRideUseCase } from "../src/book-ride.usecase.js";
import type { BookingRepository } from "../src/booking.repository.js";
import { FakeBookingRepository } from "./fakes/fake-booking.repository.js";
import { StubIDGenerator } from "./stub-id-generator.provider.js";

describe("CalculatePriceUsecase", () => {
    let calculPriceUsecase: CalculatePriceUsecase;
    let bookRideUseCase: BookRideUseCase;
    let fakeBookingRepository: FakeBookingRepository;
    let idGenerator: StubIDGenerator;

    beforeEach(() => {
        calculPriceUsecase = new CalculatePriceUsecase();
        fakeBookingRepository = new FakeBookingRepository()
        idGenerator = new StubIDGenerator()
        bookRideUseCase = new BookRideUseCase(calculPriceUsecase, idGenerator, fakeBookingRepository);
    });

    it("should not be able to book a ride (low balance)", () => {
        const bookingLowBalance = new BookingBuilder()
        .withRider(new RiderBuilder().withBalance(1).build())
        .build();
        const bookstatus = bookRideUseCase.execute(bookingLowBalance);

        expect(bookstatus).toBe(false);
    });

    it("should be able to book a ride (higher balance)", () => {
        const bookingHighBalance = new BookingBuilder().build();
        const bookstatus = bookRideUseCase.execute(bookingHighBalance);

        expect(bookstatus).toBe(true);
    });

    it("should reject booking when the rider has an unassigned active reservation", () => {
        const failedBooking = new BookingBuilder().withPendingBooking(true).build();
        const bookstatus = bookRideUseCase.execute(failedBooking);

        expect(bookstatus).toBe(false);
    })

    it("should return an ID ")

});