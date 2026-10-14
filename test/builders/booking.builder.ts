import type { Ride } from "../../src/ride.js";
import type { Rider } from "../../src/rider.js";
import type { Booking } from "../book-ride.usecase.test.js";
import { RideBuilder } from "./ride.builder.js";
import { RiderBuilder } from "./rider.builder.js";

export class BookingBuilder {
    private rider: Rider = new RiderBuilder().build();
    private ride: Ride = new RideBuilder().build();
    private hasPendingBooking = false;

    withRider(rider: Rider): this {
        this.rider = rider;
        return this;
    }

    withRide(ride: Ride): this {
        this.ride = ride;
        return this;
    }

    withPendingBooking(hasPendingBooking: boolean): this {
        this.hasPendingBooking = hasPendingBooking;
        return this;
    }

    build(): Booking {
        return {
            rider: { ...this.rider },
            ride: { ...this.ride },
            hasPendingBooking: this.hasPendingBooking,
        };
    }
}