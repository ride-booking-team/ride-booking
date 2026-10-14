import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("bookings", (table) => {
        table.string("id").primary();

        table.string("rider_id").notNullable();
        table.string("ride_id").notNullable();
        table.string("driver_id").nullable();

        table.string("status").notNullable();

        table.string("departure").notNullable();
        table.string("destination").notNullable();
        table.float("distance_km").notNullable();

        table.foreign("rider_id").references("id").inTable("riders");
        table.foreign("ride_id").references("id").inTable("rides");
        table.foreign("driver_id").references("id").inTable("drivers");
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("bookings");
}
