import { Rider } from "../domain/models/rider.js";

export type RiderRow = {
    id: string;
    balance: number | string;
    birth_date: Date | string;
};

/**
 * Le modèle métier vers la ligne SQL.
 */
export function toRiderRow(rider: Rider): RiderRow {
    return {
        id: rider.id,
        balance: rider.balance,
        birth_date: rider.birthDate,
    };
}

/**
 * La ligne SQL vers le modèle métier,
 * qui reste libre de la refuser.
 */
export function toRider(row: RiderRow): Rider {
    return new Rider(
        row.id,
        Number(row.balance),
        new Date(row.birth_date),
    );
}