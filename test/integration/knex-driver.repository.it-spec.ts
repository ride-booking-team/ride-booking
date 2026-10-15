import {
    beforeAll,
    beforeEach,
    afterAll,
    describe,
    it,
    expect,
} from "vitest";

import { knex, type Knex } from "knex";

import knexConfig from "../../setup-integration-tests/knexfile.js";

import {
    startDockerPostgresql,
    stopDockerPostgresql,
    resetDB,
} from "../../setup-integration-tests/docker-postgresql-manager.js";

import { KnexDriverRepository } from "../../src/infra/knex-driver.repository.js";
import type { Driver } from "../../src/domain/models/driver.js";

describe("KnexDriverRepository", () => {
    let sqlConnection: Knex;
    let repository: KnexDriverRepository;

    beforeAll(async () => {
        await startDockerPostgresql();

        sqlConnection = knex(knexConfig.test);
        repository = new KnexDriverRepository(sqlConnection);
    });

    beforeEach(async () => {
        await resetDB(sqlConnection);
    });

    afterAll(async () => {
        await sqlConnection?.destroy();
        await stopDockerPostgresql();
    });

    it("should save a driver in PostgreSQL", async () => {
        const driver: Driver = {
            id: "driver-1",
            name: "Alice",
            available: true,
        };

        await repository.save(driver);

        const savedDriver = await sqlConnection("drivers")
            .where({ id: "driver-1" })
            .first();

        expect(savedDriver).toBeDefined();
        expect(savedDriver.name).toBe("Alice");
        expect(savedDriver.available).toBe(true);
    });

    it("should find a driver by id", async () => {
        const driver: Driver = {
            id: "driver-1",
            name: "Alice",
            available: false,
        };

        await repository.save(driver);

        const result = await repository.findById("driver-1");

        expect(result).toEqual(driver);
    });

    it("should update an existing driver", async () => {
        await repository.save({ id: "driver-1", name: "Alice", available: true });
        await repository.save({ id: "driver-1", name: "Alice", available: false });

        const result = await repository.findById("driver-1");

        expect(result?.available).toBe(false);
    });

    it("should return null when driver does not exist", async () => {
        const result = await repository.findById("unknown-driver");

        expect(result).toBeNull();
    });
});
