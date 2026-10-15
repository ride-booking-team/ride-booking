
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { knex, type Knex } from "knex";

import knexConfig from "../../setup-integration-tests/knexfile.js";
import {
    startDockerPostgresql,
    stopDockerPostgresql,
    resetDB,
} from "../../setup-integration-tests/docker-postgresql-manager.js";

import { KnexRiderRepository } from "../../src/infra/knex-rider.repository.js";
import { Rider } from "../../src/domain/models/rider.js";

describe("KnexRiderRepository", () => {
    let sqlConnection: Knex;
    let repository: KnexRiderRepository;

    beforeAll(async () => {
        await startDockerPostgresql();

        sqlConnection = knex(knexConfig.test);
        repository = new KnexRiderRepository(sqlConnection);
    }, 120_000);

    beforeEach(async () => {
        await resetDB(sqlConnection);
    });

    afterAll(async () => {
        await sqlConnection?.destroy();
        await stopDockerPostgresql();
    });

    it("should save a rider in PostgreSQL", async () => {
        const rider = new Rider(
            "rider-1",
            100,
            new Date("2000-05-15"),
        );

        await repository.save(rider);

        const row = await sqlConnection("riders")
            .where({ id: "rider-1" })
            .first();

        expect(row).toBeDefined();
        expect(Number(row.balance)).toBe(100);
    });

    it("should find a rider by id", async () => {
        await sqlConnection("riders").insert({
            id: "rider-2",
            balance: 75,
            birth_date: "1998-03-10",
        });

        const rider = await repository.findById("rider-2");

        expect(rider).toBeInstanceOf(Rider);
        expect(rider?.id).toBe("rider-2");
        expect(rider?.balance).toBe(75);
    });

    it("should keep the birth date, whatever the timezone of the server", async () => {
        await repository.save(new Rider("rider-1", 100, new Date("2000-10-14")));

        const rider = await repository.findById("rider-1");

        expect(rider?.birthDate).toEqual(new Date("2000-10-14"));
        expect(rider?.isBirthday(new Date("2026-10-14"))).toBe(true);
    });

    it("should return null when rider does not exist", async () => {
        const rider = await repository.findById("unknown");

        expect(rider).toBeNull();
    });
});
