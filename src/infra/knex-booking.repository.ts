import type { Knex } from "knex";

import type { Booking } from "../domain/models/booking.js";
import type { BookingRepository } from "../domain/ports/booking.repository.js";
import {
    toBooking,
    toBookingRow,
    toRideRow,
    type BookingRow,
    type RideRow,
} from "./booking.mapper.js";

export class KnexBookingRepository implements BookingRepository {
    constructor(private readonly knex: Knex) {}

    async save(booking: Booking): Promise<void> {
        await this.knex.transaction(async (trx) => {
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
        });
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