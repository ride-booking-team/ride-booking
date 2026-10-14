import { beforeAll, beforeEach, afterAll, describe, it, expect } from "vitest";
import { knex, type Knex } from "knex";

import knexConfig from "../../setup-integration-tests/knexfile.js";
import {
    startDockerPostgresql,
    stopDockerPostgresql,
    resetDB,
} from "../../setup-integration-tests/docker-postgresql-manager.js";

import { KnexBookingRepository } from "../../src/infra/knex-booking.repository.js";
import type { Booking } from "../../src/domain/models/booking.js";

describe("KnexBookingRepository", () => {
    let sqlConnection: Knex;
    let repository: KnexBookingRepository;

    beforeAll(async () => {
        await startDockerPostgresql();

        sqlConnection = knex(knexConfig.test);
        repository = new KnexBookingRepository(sqlConnection);
    });

    beforeEach(async () => {
        await resetDB(sqlConnection);
    });

    afterAll(async () => {
        await sqlConnection?.destroy();
        await stopDockerPostgresql();
    });

    it("should save a booking in PostgreSQL", async () => {
        const booking: Booking = {
            id: "booking-1",
            riderId: "rider-1",
            status: "pending",
            ride: {
                id: "ride-1",
                departure: "Paris",
                destination: "Lyon",
                distanceKm: 460,
            },
        };

        await sqlConnection("riders").insert({
            id: "rider-1",
            balance: 100,
            birth_date: new Date("2000-01-01"),
        });

        await repository.save(booking);

        const savedBooking = await sqlConnection("bookings")
            .where({ id: "booking-1" })
            .first();

        expect(savedBooking).toBeDefined();
        expect(savedBooking.rider_id).toBe("rider-1");
        expect(savedBooking.ride_id).toBe("ride-1");
        expect(savedBooking.status).toBe("pending");
        expect(savedBooking.departure).toBe("Paris");
        expect(savedBooking.destination).toBe("Lyon");
        expect(Number(savedBooking.distance_km)).toBe(460);
    });

    it("should find a booking by id", async () => {
        await sqlConnection("riders").insert({
            id: "rider-1",
            balance: 100,
            birth_date: new Date("2000-01-01"),
        });

        const booking: Booking = {
            id: "booking-1",
            riderId: "rider-1",
            status: "pending",
            ride: {
                id: "ride-1",
                departure: "Paris",
                destination: "Lyon",
                distanceKm: 460,
            },
        };

        await repository.save(booking);

        const result = await repository.findById("booking-1");

        expect(result).toEqual(booking);
    });
    it("should save a booking with an assigned driver", async () => {
        await sqlConnection("riders").insert({
            id: "rider-1",
            balance: 100,
            birth_date: new Date("2000-01-01"),
        });
        await sqlConnection("drivers").insert({
            id: "driver-1",
            name: "Alice",
            available: false,
        });

        const booking: Booking = {
            id: "booking-1",
            riderId: "rider-1",
            driverId: "driver-1",
            status: "assigned",
            ride: {
                id: "ride-1",
                departure: "Paris",
                destination: "Lyon",
                distanceKm: 460,
            },
        };

        await repository.save(booking);

        const result = await repository.findById("booking-1");

        expect(result).toEqual(booking);
    });

    it("should reject a booking with an unknown driver", async () => {
        await sqlConnection("riders").insert({
            id: "rider-1",
            balance: 100,
            birth_date: new Date("2000-01-01"),
        });

        const booking: Booking = {
            id: "booking-1",
            riderId: "rider-1",
            driverId: "unknown-driver",
            status: "assigned",
            ride: {
                id: "ride-1",
                departure: "Paris",
                destination: "Lyon",
                distanceKm: 460,
            },
        };

        await expect(repository.save(booking)).rejects.toThrow();
    });

    it("should return null when booking does not exist", async () => {
        const result = await repository.findById("unknown-booking");

        expect(result).toBeNull();
    });
});