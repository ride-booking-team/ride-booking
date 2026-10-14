import type {Booking, BookingStatus} from "../../src/booking.js";
import { RideBuilder } from "./ride.builder.js";
import { RiderBuilder } from "./rider.builder.js";

export class BookingBuilder {
    private booking: Booking = {
        id: "",
        rider: new RiderBuilder().build(),
        ride: new RideBuilder().build(),
        status: "pending",
    };

    withId(id: string): this {
        this.booking.id = id;
        return this;
    }

    withRider(rider: Booking["rider"]): this {
        this.booking.rider = rider;
        return this;
    }

    withRide(ride: Booking["ride"]): this {
        this.booking.ride = ride;
        return this;
    }

    withStatus(status: BookingStatus) {
        this.booking.status = status;
        return this;
    }

    withDriverId(driverId: string) {
        this.booking.driverId = driverId;
        return this;
    }

    build(): Booking {
        return {
            ...this.booking,
            rider: { ...this.booking.rider },
            ride: { ...this.booking.ride },
        };
    }
}