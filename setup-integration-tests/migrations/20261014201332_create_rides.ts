import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("rides", (table) => {
        table.string("id").primary();
        table.string("departure").notNullable();
        table.string("destination").notNullable();
        table.float("distance_km").notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("rides");
}
