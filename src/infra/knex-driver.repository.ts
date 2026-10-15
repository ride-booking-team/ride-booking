import type { Knex } from "knex";
import type { Driver } from "../domain/models/driver.js";
import type { DriverRepository } from "../domain/ports/driver.repository.js";
import { toDriver, toDriverRow, type DriverRow } from "./driver.mapper.js";

export class KnexDriverRepository implements DriverRepository {
    constructor(private readonly knex: Knex) {}

    async save(driver: Driver): Promise<void> {
        await this.knex<DriverRow>("drivers")
            .insert(toDriverRow(driver))
            .onConflict("id")
            .merge();
    }

    async findById(id: string): Promise<Driver | null> {
        const row = await this.knex<DriverRow>("drivers")
            .where({ id })
            .first();

        return row ? toDriver(row) : null;
    }
}