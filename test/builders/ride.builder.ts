import type { Ride } from "../../src/ride.js";

export class RideBuilder {
    private ride: Ride = {
        departure: "Paris",
        destination: "Paris",
        distanceKm: 0,
    };

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