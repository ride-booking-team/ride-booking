import type { Ride } from "../../src/domain/models/ride.js";

export class RideBuilder {
    private ride: Ride = {
        id: "ride-1",
        departure: "Paris",
        destination: "Paris",
        distanceKm: 0,
    };

    withId(id: string): this {
        this.ride.id = id;
        return this;
    }

    from(departure: string): this {
        this.ride.departure = departure;
        return this;
    }

    to(destination: string): this {
        this.ride.destination = destination;
        return this;
    }

    withDistance(distanceKm: number): this {
        this.ride.distanceKm = distanceKm;
        return this;
    }

    build(): Ride {
        return { ...this.ride };
    }
}