import { Booking } from "../../src/domain/models/booking.js";
import type { Ride } from "../../src/domain/models/ride.js";
import { BookingStatus } from "../../src/domain/value-objects/booking-status.js";
import { RideBuilder } from "./ride.builder.js";

export class BookingBuilder {
    private id = "";
    private riderId = "rider-1";
    private ride: Ride = new RideBuilder().build();
    private status = BookingStatus.PENDING;
    private price = 12.5;
    private driverId: string | undefined;

    withId(id: string): this {
        this.id = id;
        return this;
    }

    withRiderId(riderId: string): this {
        this.riderId = riderId;
        return this;
    }

    withRide(ride: Ride): this {
        this.ride = ride;
        return this;
    }

    withStatus(status: string): this {
        this.status = BookingStatus.of(status);
        return this;
    }

    withDriverId(driverId: string): this {
        this.driverId = driverId;
        return this;
    }

    withPrice(price: number): this {
        this.price = price;
        return this;
    }

    build(): Booking {
        return new Booking({
            id: this.id,
            riderId: this.riderId,
            ride: this.ride,
            status: this.status,
            price: this.price,
            driverId: this.driverId,
        });
    }
}