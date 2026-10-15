import { describe, it, expect, beforeEach } from "vitest";
import { AssignDriverUseCase } from "../src/application/use-cases/assign-driver.usecase.js";
import { BookingStatus } from "../src/domain/value-objects/booking-status.js";
import { FakeBookingRepository } from "./fakes/fake-booking.repository.js";
import { FakeRiderRepository } from "./fakes/fake-rider.repository.js";
import { BookingBuilder } from "./builders/booking.builder.js";
import { RiderBuilder } from "./builders/rider.builder.js";

describe("AssignDriverUseCase", () => {
    let assignDriver: AssignDriverUseCase;
    let bookingRepository: FakeBookingRepository;
    let riderRepository: FakeRiderRepository;

    beforeEach(async () => {
        bookingRepository = new FakeBookingRepository();
        riderRepository = new FakeRiderRepository();
        assignDriver = new AssignDriverUseCase(bookingRepository, riderRepository);

        await riderRepository.save(new RiderBuilder().withId("rider-1").build());
        await bookingRepository.save(
            new BookingBuilder().withId("booking-1").withRiderId("rider-1").build(),
        );
    });

    it("should assign a driver the rider has not blocked", async () => {
        await assignDriver.execute({ bookingId: "booking-1", driverId: "driver-1" });

        const booking = await bookingRepository.findById("booking-1");
        expect(booking?.driverId).toBe("driver-1");
        expect(booking?.status).toEqual(BookingStatus.ASSIGNED);
    });

    it("should not assign a driver the rider has blocked", async () => {
        const rider = new RiderBuilder().withId("rider-1").build();
        rider.blockDriver("driver-1");
        await riderRepository.save(rider);

        await assignDriver.execute({ bookingId: "booking-1", driverId: "driver-1" });

        const booking = await bookingRepository.findById("booking-1");
        expect(booking?.driverId).toBeUndefined();
        expect(booking?.status).toEqual(BookingStatus.PENDING);
    });
});