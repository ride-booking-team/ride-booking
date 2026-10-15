import type { Driver } from "../domain/models/driver.js";

export type DriverRow = {
    id: string;
    name: string;
    available: boolean;
};

/**
 * Le modèle métier vers la ligne SQL.
 */
export function toDriverRow(driver: Driver): DriverRow {
    return {
        id: driver.id,
        name: driver.name,
        available: driver.available,
    };
}

/**
 * La ligne SQL vers le modèle métier.
 */
export function toDriver(row: DriverRow): Driver {
    return {
        id: row.id,
        name: row.name,
        available: row.available,
    };
}