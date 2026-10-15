import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("drivers", (table) => {
        table.string("id").primary();
        table.string("name").notNullable();
        table.boolean("available").notNullable().defaultTo(true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("drivers");
}
