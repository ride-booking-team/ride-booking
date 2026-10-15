import path from "node:path";
import {
    DockerComposeEnvironment,
    type StartedDockerComposeEnvironment,
} from "testcontainers";
import { knex, type Knex } from "knex";
import knexConfig from "./knexfile.js";

const composeFilePath = path.resolve(
    process.cwd(),
    "setup-integration-tests",
);

const composeFile = "docker-compose-postgresql-test.yaml";

export let dockerDBInstance: StartedDockerComposeEnvironment | null = null;

export async function startDockerPostgresql(): Promise<void> {
    let sqlConnection: Knex | null = null;

    try {
        console.log("Starting PostgreSQL...");

        dockerDBInstance = await new DockerComposeEnvironment(
            composeFilePath,
            composeFile,
        ).up();

        sqlConnection = knex(knexConfig.test);

        await sqlConnection.migrate.latest();

        console.log("PostgreSQL ready");
    } catch (error) {
        console.error("Failed to start PostgreSQL:", error);
        await stopDockerPostgresql();
        throw error;
    } finally {
        await sqlConnection?.destroy();
    }
}

const tables = ["bookings", "rides", "riders", "drivers"];

export async function resetDB(sqlConnection: Knex): Promise<void> {
    await sqlConnection.raw(
        `TRUNCATE TABLE ${tables.join(", ")} RESTART IDENTITY CASCADE`,
    );
}

export async function stopDockerPostgresql(): Promise<void> {
    if (dockerDBInstance) {
        await dockerDBInstance.down();
        dockerDBInstance = null;
    }
}
