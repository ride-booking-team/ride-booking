import type { Knex } from "knex";
import type { RiderRepository } from "../domain/ports/rider.repository.js";
import type { Rider } from "../domain/models/rider.js";
import { toRider, toRiderRow, type RiderRow } from "./rider.mapper.js";

export class KnexRiderRepository implements RiderRepository {
    constructor(private readonly knex: Knex) {}

    async save(rider: Rider): Promise<void> {
        await this.knex<RiderRow>("riders")
            .insert(toRiderRow(rider))
            .onConflict("id")
            .merge();
    }

    async findById(id: string): Promise<Rider | null> {
        const row = await this.knex<RiderRow>("riders")
            .where({ id })
            .first();

        return row ? toRider(row) : null;
    }
}