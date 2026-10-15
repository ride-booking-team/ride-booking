import { beforeAll, beforeEach, afterAll, describe, it, expect } from "vitest";
import { knex, type Knex } from "knex";

import knexConfig from "../../setup-integration-tests/knexfile.js";
import {
    startDockerPostgresql,
    stopDockerPostgresql,
    resetDB,
} from "../../setup-integration-tests/docker-postgresql-manager.js";

import { KnexBookingRepository } from "../../src/infra/knex-booking.repository.js";
import { Booking } from "../../src/domain/models/booking.js";
import { BookingStatus } from "../../src/domain/value-objects/booking-status.js";
import {
    bookingRepositoryContract,
    CONTRACT_DRIVER_ID,
    CONTRACT_RIDER_IDS,
} from "../contracts/booking-repository.contract.js";

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
        const booking = new Booking({
            id: "booking-1",
            riderId: "rider-1",
            status: BookingStatus.PENDING,
            ride: {
                id: "ride-1",
                departure: "Paris",
                destination: "Lyon",
                distanceKm: 460,
            },
        });

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

    it("should reject a booking with an unknown driver", async () => {
        await sqlConnection("riders").insert({
            id: "rider-1",
            balance: 100,
            birth_date: new Date("2000-01-01"),
        });

        const booking = new Booking({
            id: "booking-1",
            riderId: "rider-1",
            driverId: "unknown-driver",
            status: BookingStatus.ASSIGNED,
            ride: {
                id: "ride-1",
                departure: "Paris",
                destination: "Lyon",
                distanceKm: 460,
            },
        });

        await expect(repository.save(booking)).rejects.toThrow();
    });

    it("should refuse to read a booking with an invalid status", async () => {
        await sqlConnection("riders").insert({
            id: "rider-1",
            balance: 100,
            birth_date: new Date("2000-01-01"),
        });
        await sqlConnection("rides").insert({
            id: "ride-1",
            departure: "Paris",
            destination: "Lyon",
            distance_km: 460,
        });
        await sqlConnection("bookings").insert({
            id: "booking-1",
            rider_id: "rider-1",
            ride_id: "ride-1",
            status: "toto",
            departure: "Paris",
            destination: "Lyon",
            distance_km: 460,
        });

        await expect(repository.findById("booking-1")).rejects.toThrow(
            /invalid booking status/,
        );
    });

    bookingRepositoryContract("KnexBookingRepository", async () => {
        await sqlConnection("riders").insert(
            CONTRACT_RIDER_IDS.map((id) => ({
                id,
                balance: 100,
                birth_date: new Date("2000-01-01"),
            })),
        );
        await sqlConnection("drivers").insert({
            id: CONTRACT_DRIVER_ID,
            name: "Alice",
            available: false,
        });

        return repository;
    });
});