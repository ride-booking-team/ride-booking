import type { Knex } from "knex";

import type { Booking } from "../domain/models/booking.js";
import { BookingStatus } from "../domain/value-objects/booking-status.js";
import type { BookingRepository } from "../domain/ports/booking.repository.js";

type BookingRow = {
    id: string;
    rider_id: string;
    ride_id: string;
    driver_id: string | null;
    status: string;
    departure: string;
    destination: string;
    distance_km: number | string;
};

export class KnexBookingRepository implements BookingRepository {
    constructor(private readonly knex: Knex) {}

    async save(booking: Booking): Promise<void> {
        await this.knex.transaction(async (trx) => {
            // Enregistrer le trajet dans la table rides
            await trx("rides")
                .insert({
                    id: booking.ride.id,
                    departure: booking.ride.departure,
                    destination: booking.ride.destination,
                    distance_km: booking.ride.distanceKm,
                })
                .onConflict("id")
                .merge();

            // Enregistrer la réservation
            await trx("bookings")
                .insert({
                    id: booking.id,
                    rider_id: booking.riderId,
                    ride_id: booking.ride.id,
                    driver_id: booking.driverId ?? null,
                    status: booking.status.toString(),
                    departure: booking.ride.departure,
                    destination: booking.ride.destination,
                    distance_km: booking.ride.distanceKm,
                })
                .onConflict("id")
                .merge();
        });
    }

    async findById(id: string): Promise<Booking | null> {
        const row = await this.knex<BookingRow>("bookings")
            .where({ id })
            .first();

        return row ? this.toBooking(row) : null;
    }

    async findByRiderId(id: string): Promise<Booking[]> {
        const rows = await this.knex<BookingRow>("bookings")
            .where({ rider_id: id })
            .select("*");

        return rows.map((row) => this.toBooking(row));
    }

    private toBooking(row: BookingRow): Booking {
        return {
            id: row.id,
            riderId: row.rider_id,
            status: BookingStatus.of(row.status),
            ...(row.driver_id !== null
                ? { driverId: row.driver_id }
                : {}),
            ride: {
                id: row.ride_id,
                departure: row.departure,
                destination: row.destination,
                distanceKm: Number(row.distance_km),
            },
        };
    }
}