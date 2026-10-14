import { describe, it, expect, beforeEach } from "vitest";
import {FakeBookingRepository} from "./fakes/fake-booking.repository.js";
import {BookingBuilder} from "./builders/booking.builder.js";
import {CancelRideUseCase} from "../src/cancel-ride.usecase.js";
import {StubDateProvider} from "./stub-date.provider.js";
import {RiderBuilder} from "./builders/rider.builder.js";


describe("CancelRideUseCase", () => {
    let cancelRideUseCase: CancelRideUseCase;
    let fakeBookingRepository: FakeBookingRepository;
    let dateProvider: StubDateProvider;

    beforeEach(() => {
        fakeBookingRepository = new FakeBookingRepository();
        dateProvider = new StubDateProvider();
        cancelRideUseCase = new CancelRideUseCase(fakeBookingRepository,dateProvider);
    });

    it("should cancel a pending booking without penalty", async () => {
        const booking = new BookingBuilder()
            .withStatus("pending")
            .build();

        await fakeBookingRepository.save(booking);

        const result = await cancelRideUseCase.execute({
            bookingId: booking.id,
        });

        expect(result).toEqual({ penalty: 0 });
    });

    it("should charge 5 euros when the driver is on the way", async () => {
        const booking = new BookingBuilder()
            .withStatus("on_the_way")
            .withDriverId("driver-1")
            .build();

        await fakeBookingRepository.save(booking);

        const result = await cancelRideUseCase.execute({
            bookingId: booking.id,
        });

        expect(result).toEqual({ penalty: 5 });
    });

    it("should reject cancellation when booking is already cancelled", async () => {
        const booking = new BookingBuilder()
            .withStatus("cancelled")
            .build();

        await fakeBookingRepository.save(booking);

        const result = await cancelRideUseCase.execute({
            bookingId: booking.id,
        });

        expect(result).toBeNull();
    });


    it("should cancel without penalty on rider birthday", async () => {
        dateProvider.date = new Date("2026-10-14");

        const rider = new RiderBuilder()
            .withBirthDate(new Date("2000-10-14"))
            .build();

        const booking = new BookingBuilder()
            .withRider(rider)
            .withStatus("on_the_way")
            .withDriverId("driver-1")
            .build();

        await fakeBookingRepository.save(booking);

        const result = await cancelRideUseCase.execute({
            bookingId: booking.id,
        });

        expect(result).toEqual({ penalty: 0 });
    });
    it("should deduct 5 euros from rider balance when driver is on the way", async () => {
        dateProvider.date = new Date("2026-10-15");

        const rider = new RiderBuilder()
            .withBalance(10)
            .withBirthDate(new Date("2000-01-01"))
            .build();

        const booking = new BookingBuilder()
            .withRider(rider)
            .withStatus("on_the_way")
            .withDriverId("driver-1")
            .build();

        await fakeBookingRepository.save(booking);

        const result = await cancelRideUseCase.execute({
            bookingId: booking.id,
        });

        const savedBooking = await fakeBookingRepository.findById(booking.id);

        expect(result).toEqual({ penalty: 5 });
        expect(savedBooking?.rider.balance).toBe(5);
        expect(savedBooking?.status).toBe("cancelled");
    });
});