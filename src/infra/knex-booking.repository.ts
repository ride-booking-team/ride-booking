import type { Knex } from "knex";

import type { Booking } from "../domain/models/booking.js";
import type { Rider } from "../domain/models/rider.js";
import type { BookingRepository } from "../domain/ports/booking.repository.js";
import {
    toBooking,
    toBookingRow,
    type BookingRow,
} from "./booking.mapper.js";
import { toRideRow, type RideRow } from "./ride.mapper.js";
import { toRiderRow, type RiderRow } from "./rider.mapper.js";

export class KnexBookingRepository implements BookingRepository {
    constructor(private readonly knex: Knex) {}

    async save(booking: Booking): Promise<void> {
        await this.knex.transaction(async (trx) => {
            await this.writeBooking(trx, booking);
        });
    }

    async saveWithRider(booking: Booking, rider: Rider): Promise<void> {
        // Une seule transaction : si l'écriture du rider échoue,
        // Postgres annule aussi le trajet et la réservation (ROLLBACK).
        await this.knex.transaction(async (trx) => {
            await this.writeBooking(trx, booking);

            await trx<RiderRow>("riders")
                .insert(toRiderRow(rider))
                .onConflict("id")
                .merge();
        });
    }

    private async writeBooking(trx: Knex.Transaction, booking: Booking): Promise<void> {
        // Enregistrer le trajet dans la table rides
        await trx<RideRow>("rides")
            .insert(toRideRow(booking.ride))
            .onConflict("id")
            .merge();

        // Enregistrer la réservation
        await trx<BookingRow>("bookings")
            .insert(toBookingRow(booking))
            .onConflict("id")
            .merge();
    }

    async findById(id: string): Promise<Booking | null> {
        const row = await this.knex<BookingRow>("bookings")
            .where({ id })
            .first();

        return row ? toBooking(row) : null;
    }

    async findByRiderId(id: string): Promise<Booking[]> {
        const rows = await this.knex<BookingRow>("bookings")
            .where({ rider_id: id })
            .select("*");

        return rows.map((row) => toBooking(row));
    }
}