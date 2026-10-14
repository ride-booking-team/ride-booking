import type { Knex } from "knex";
import type { Driver } from "../domain/models/driver.js";
import type { DriverRepository } from "../domain/ports/driver.repository.js";

type DriverRow = {
    id: string;
    name: string;
    available: boolean;
};

export class KnexDriverRepository implements DriverRepository {
    constructor(private readonly knex: Knex) {}

    async save(driver: Driver): Promise<void> {
        await this.knex("drivers")
            .insert({
                id: driver.id,
                name: driver.name,
                available: driver.available,
            })
            .onConflict("id")
            .merge();
    }

    async findById(id: string): Promise<Driver | null> {
        const row = await this.knex<DriverRow>("drivers")
            .where({ id })
            .first();

        if (!row) {
            return null;
        }

        return {
            id: row.id,
            name: row.name,
            available: row.available,
        };
    }
}
