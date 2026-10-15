import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("riders", (table) => {
        table.string("id").primary();
        table.decimal("balance", 10, 2).notNullable();
        table.date("birth_date").notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("riders");
}

