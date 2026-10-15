import type { Booking } from "../domain/models/booking.js";
import { BookingStatus } from "../domain/value-objects/booking-status.js";

export type BookingRow = {
    id: string;
    rider_id: string;
    ride_id: string;
    driver_id: string | null;
    status: string;
    departure: string;
    destination: string;
    distance_km: number | string;
};

/**
 * Le modèle métier vers les lignes SQL.
 * C'est ici que le métier devient plat.
 */
export function toBookingRow(booking: Booking): BookingRow {
    return {
        id: booking.id,
        rider_id: booking.riderId,
        ride_id: booking.ride.id,
        driver_id: booking.driverId ?? null,
        status: booking.status.toString(),
        departure: booking.ride.departure,
        destination: booking.ride.destination,
        distance_km: booking.ride.distanceKm,
    };
}

/**
 * Les lignes SQL vers le modèle métier,
 * qui reste libre de les refuser.
 */
export function toBooking(row: BookingRow): Booking {
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