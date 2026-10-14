import { describe, it, expect, beforeEach } from "vitest";
import { BookingBuilder } from "./builders/booking.builder.js";
import { RiderBuilder } from "./builders/rider.builder.js";
import { RideBuilder } from "./builders/ride.builder.js";
import { CalculatePriceUsecase } from "../src/calculate-price.usecase.js";
import { BookRideUseCase } from "../src/book-ride.usecase.js";
import { FakeBookingRepository } from "./fakes/fake-booking.repository.js";
import { StubIDGenerator } from "./stub-id-generator.provider.js";

describe("BookRideUseCase", () => {
    let calculatePriceUsecase: CalculatePriceUsecase;
    let bookRideUseCase: BookRideUseCase;
    let fakeBookingRepository: FakeBookingRepository;
    let idGenerator: StubIDGenerator;

    beforeEach(() => {
        calculatePriceUsecase = new CalculatePriceUsecase();
        fakeBookingRepository = new FakeBookingRepository();
        idGenerator = new StubIDGenerator();
        

        bookRideUseCase = new BookRideUseCase(
            calculatePriceUsecase,
            idGenerator,
            fakeBookingRepository,
        );
    });

    it("should reject a ride when the rider has insufficient balance", async () => {
        const params = {
            rider: new RiderBuilder().withBalance(1).build(),
            ride: new RideBuilder().build(),
        };

        const result = await bookRideUseCase.execute(params);

        expect(result).toBeNull();
    });

    it("should create a booking when the rider has sufficient balance", async () => {
        const params = {
            rider: new RiderBuilder().withBalance(10).build(),
            ride: new RideBuilder().build(),
        };

        idGenerator.id = "booking-1"
        
        const result = await bookRideUseCase.execute(params);

        expect(result).toEqual({ id: "booking-1" });
    });

    it("should reject booking when the rider already has a pending booking", async () => {
        const rider = new RiderBuilder().build();

        const existingBooking = new BookingBuilder()
            .withRider(rider)
            .withPendingBooking(true)
            .build();

        await fakeBookingRepository.save(existingBooking);

        const params = {
            rider,
            ride: new RideBuilder().build(),
        };

        const result = await bookRideUseCase.execute(params);

        expect(result).toBeNull();
    });

    it("should save the newly created booking", async () => {
        const rider = new RiderBuilder().build();
        const ride = new RideBuilder().build();

        const result = await bookRideUseCase.execute({ rider, ride });

        expect(result).not.toBeNull();

        const savedBookings =
            await fakeBookingRepository.findByRiderId(rider.id);

        expect(savedBookings).toHaveLength(1);
        expect(savedBookings[0]).toMatchObject({
            id: result!.id,
            rider,
            ride,
            hasPendingBooking: true,
        });
    });
});