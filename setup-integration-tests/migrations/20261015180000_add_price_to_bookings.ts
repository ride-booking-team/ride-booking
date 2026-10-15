import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable("bookings", (table) => {
        table.decimal("price", 10, 2).notNullable().defaultTo(0);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable("bookings", (table) => {
        table.dropColumn("price");
    });
}