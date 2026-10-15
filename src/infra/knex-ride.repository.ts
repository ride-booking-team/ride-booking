import type { Knex } from "knex";
import type { Ride } from "../domain/models/ride.js";
import type { RideRepository } from "../domain/ports/ride.repository.js";
import { toRide, toRideRow, type RideRow } from "./ride.mapper.js";

export class KnexRideRepository implements RideRepository {
    constructor(private readonly knex: Knex) {}

    async save(ride: Ride): Promise<void> {
        await this.knex<RideRow>("rides")
            .insert(toRideRow(ride))
            .onConflict("id")
            .merge();
    }

    async findById(id: string): Promise<Ride | null> {
        const row = await this.knex<RideRow>("rides")
            .where({ id })
            .first();

        return row ? toRide(row) : null;
    }
}