import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable("riders", (table) => {
        table.integer("loyalty_points").notNullable().defaultTo(0);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable("riders", (table) => {
        table.dropColumn("loyalty_points");
    });
}
