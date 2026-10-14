import type { Knex } from "knex";
import type {RiderRepository} from "../domain/ports/rider.repository.js";
import {Rider} from "../domain/models/rider.js";

export class KnexRiderRepository implements RiderRepository {
    constructor(private readonly knex: Knex) {}

    async save(rider: Rider): Promise<void> {
        await this.knex("riders")
            .insert({
                id: rider.id,
                balance: rider.balance,
                birth_date: rider.birthDate,
            })
            .onConflict("id")
            .merge();
    }

    async findById(id: string): Promise<Rider | null> {
        const row = await this.knex("riders")
            .where({ id })
            .first();

        if (!row) {
            return null;
        }

        return new Rider(
            row.id,
            Number(row.balance),
            new Date(row.birth_date),
        );
    }
}