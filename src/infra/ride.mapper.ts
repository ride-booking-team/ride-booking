import type { Ride } from "../domain/models/ride.js";

export type RideRow = {
    id: string;
    departure: string;
    destination: string;
    distance_km: number | string;
};

/**
 * Le modèle métier vers la ligne SQL.
 */
export function toRideRow(ride: Ride): RideRow {
    return {
        id: ride.id,
        departure: ride.departure,
        destination: ride.destination,
        distance_km: ride.distanceKm,
    };
}

/**
 * La ligne SQL vers le modèle métier.
 */
export function toRide(row: RideRow): Ride {
    return {
        id: row.id,
        departure: row.departure,
        destination: row.destination,
        distanceKm: Number(row.distance_km),
    };
}