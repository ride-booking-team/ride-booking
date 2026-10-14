import type { Knex } from "knex";
import type { Ride } from "../domain/models/ride.js";
import type { RideRepository } from "../domain/ports/ride.repository.js";

type RideRow = {
    id: string;
    departure: string;
    destination: string;
    distance_km: number | string;
};

export class KnexRideRepository implements RideRepository {
    constructor(private readonly knex: Knex) {}

    async save(ride: Ride): Promise<void> {
        await this.knex("rides")
            .insert({
                id: ride.id,
                departure: ride.departure,
                destination: ride.destination,
                distance_km: ride.distanceKm,
            })
            .onConflict("id")
            .merge();
    }

    async findById(id: string): Promise<Ride | null> {
        const row = await this.knex<RideRow>("rides")
            .where({ id })
            .first();

        if (!row) {
            return null;
        }

        return {
            id: row.id,
            departure: row.departure,
            destination: row.destination,
            distanceKm: Number(row.distance_km),
        };
    }
}