import type { Booking } from "../../src/domain/models/booking.js";
import { BookingStatus } from "../../src/domain/value-objects/booking-status.js";
import { RideBuilder } from "./ride.builder.js";

export class BookingBuilder {
    private booking: Booking = {
        id: "",
        riderId: "rider-1",
        ride: new RideBuilder().build(),
        status: BookingStatus.PENDING,
    };

    withId(id: string): this {
        this.booking.id = id;
        return this;
    }

    withRiderId(riderId: string): BookingBuilder {
        this.booking.riderId = riderId;
        return this;
    }

    withRide(ride: Booking["ride"]): this {
        this.booking.ride = ride;
        return this;
    }

    withStatus(status: string) {
        this.booking.status = BookingStatus.of(status);
        return this;
    }

    withDriverId(driverId: string) {
        this.booking.driverId = driverId;
        return this;
    }

    build(): Booking {
        return {
            ...this.booking,
            ride: { ...this.booking.ride },
        };
    }
}