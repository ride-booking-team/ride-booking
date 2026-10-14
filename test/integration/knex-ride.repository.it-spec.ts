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

import { KnexRideRepository } from "../../src/infra/knex-ride.repository.js";
import type { Ride } from "../../src/domain/models/ride.js";

describe("KnexRideRepository", () => {
    let sqlConnection: Knex;
    let repository: KnexRideRepository;

    beforeAll(async () => {
        await startDockerPostgresql();

        sqlConnection = knex(knexConfig.test);
        repository = new KnexRideRepository(sqlConnection);
    });

    beforeEach(async () => {
        await resetDB(sqlConnection);
    });

    afterAll(async () => {
        await sqlConnection?.destroy();
        await stopDockerPostgresql();
    });

    it("should save a ride in PostgreSQL", async () => {
        const ride: Ride = {
            id: "ride-1",
            departure: "Paris",
            destination: "Lyon",
            distanceKm: 460,
        };

        await repository.save(ride);

        const savedRide = await sqlConnection("rides")
            .where({ id: "ride-1" })
            .first();

        expect(savedRide).toBeDefined();
        expect(savedRide.departure).toBe("Paris");
        expect(savedRide.destination).toBe("Lyon");
        expect(Number(savedRide.distance_km)).toBe(460);
    });

    it("should find a ride by id", async () => {
        const ride: Ride = {
            id: "ride-1",
            departure: "Paris",
            destination: "Lyon",
            distanceKm: 460,
        };

        await repository.save(ride);

        const result = await repository.findById("ride-1");

        expect(result).toEqual(ride);
    });

    it("should return null when ride does not exist", async () => {
        const result = await repository.findById("unknown-ride");

        expect(result).toBeNull();
    });
});