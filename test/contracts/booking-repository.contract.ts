import { describe, it, expect } from "vitest";

import type { BookingRepository } from "../../src/domain/ports/booking.repository.js";
import { BookingStatus } from "../../src/domain/value-objects/booking-status.js";
import { BookingBuilder } from "../builders/booking.builder.js";
import { RideBuilder } from "../builders/ride.builder.js";

// Les riders et le driver que chaque repository doit connaître
// avant de lancer le contrat (la base en a besoin pour ses clés étrangères).
export const CONTRACT_RIDER_IDS = ["rider-1", "rider-2"];
export const CONTRACT_DRIVER_ID = "driver-1";

const aBooking = (id: string) =>
    new BookingBuilder()
        .withId(id)
        .withRiderId("rider-1")
        .withRide(new RideBuilder().withId(`ride-of-${id}`).build());

export function bookingRepositoryContract(
    name: string,
    make: () => Promise<BookingRepository>,
): void {
    describe(`${name} honours the BookingRepository contract`, () => {
        it("gives back nothing for an unknown booking", async () => {
            const bookings = await make();

            expect(await bookings.findById("nobody")).toBeNull();
        });

        it("gives back the booking that was saved", async () => {
            const bookings = await make();
            const booking = aBooking("booking-1").build();

            await bookings.save(booking);

            expect(await bookings.findById("booking-1")).toEqual(booking);
        });

        it("keeps the assigned driver", async () => {
            const bookings = await make();
            const booking = aBooking("booking-1")
                .withStatus("assigned")
                .withDriverId(CONTRACT_DRIVER_ID)
                .build();

            await bookings.save(booking);

            expect(await bookings.findById("booking-1")).toEqual(booking);
        });

        it("saving a booking already known replaces it", async () => {
            const bookings = await make();
            const booking = aBooking("booking-1").build();

            await bookings.save(booking);
            await bookings.save({ ...booking, status: BookingStatus.CANCELLED });

            expect((await bookings.findById("booking-1"))?.status).toEqual(
                BookingStatus.CANCELLED,
            );
        });

        it("a booking read back cannot be changed behind the repository's back", async () => {
            const bookings = await make();
            await bookings.save(aBooking("booking-1").build());

            const readBack = await bookings.findById("booking-1");
            readBack!.status = BookingStatus.CANCELLED;

            expect((await bookings.findById("booking-1"))?.status).toEqual(
                BookingStatus.PENDING,
            );
        });

        it("gives back only the bookings of the given rider", async () => {
            const bookings = await make();
            const ofRider1 = aBooking("booking-1").build();
            const ofRider2 = aBooking("booking-2").withRiderId("rider-2").build();

            await bookings.save(ofRider1);
            await bookings.save(ofRider2);

            expect(await bookings.findByRiderId("rider-1")).toEqual([ofRider1]);
        });

        it("gives back no bookings for a rider who has none", async () => {
            const bookings = await make();

            expect(await bookings.findByRiderId("rider-2")).toEqual([]);
        });
    });
}