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
        // Le jour UTC, sans heure : sinon Postgres le décale selon le fuseau du serveur.
        birth_date: rider.birthDate.toISOString().slice(0, 10),
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
        toUtcDay(row.birth_date),
    );
}

/**
 * Le driver pg lit une colonne DATE comme minuit *heure locale* :
 * à Paris, le 14 octobre devient le 13 à 22h UTC.
 * On reprend le jour tel qu'il est écrit en base, à minuit UTC.
 */
function toUtcDay(value: Date | string): Date {
    if (typeof value === "string") {
        return new Date(`${value.slice(0, 10)}T00:00:00Z`);
    }

    return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
}