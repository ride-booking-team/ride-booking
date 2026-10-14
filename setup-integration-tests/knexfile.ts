import type { Knex } from "knex";
import { fileURLToPath } from "node:url";

const migrationsDirectory = fileURLToPath(
    new URL("./migrations/", import.meta.url)
);

const productionConnection = process.env.DATABASE_URL;

const config = {
    development: {
        client: "pg",
        connection: {
            host: "127.0.0.1",
            port: 5433,
            user: "postgres",
            password: "secret",
            database: "ride_booking",
        },
        migrations: {
            directory: migrationsDirectory,
            extension: "ts",
        },
    },

    test: {
        client: "pg",
        connection: {
            host: "127.0.0.1",
            port: 5433,
            user: "postgres",
            password: "secret",
            database: "ride_booking",
        },
        migrations: {
            directory: migrationsDirectory,
            extension: "ts",
        },
    },

    production: {
        client: "pg",
        ...(productionConnection
            ? { connection: productionConnection }
            : {}),
        migrations: {
            directory: migrationsDirectory,
            extension: "ts",
        },
    },
} satisfies Record<string, Knex.Config>;

export default config;