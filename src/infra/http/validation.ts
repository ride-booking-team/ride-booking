import type { Response } from "express";

export type RideRequest = {
    riderId: string;
    from: string;
    to: string;
    uberX: boolean;
};

/**
 * Lit { riderId, from, to, uberX? } dans le corps de la requête.
 * Répond 400 et renvoie null si le corps n'est pas valide.
 */
export function readRideRequest(body: unknown, response: Response): RideRequest | null {
    const { riderId, from, to, uberX } = (body ?? {}) as Record<string, unknown>;

    if (!isFilled(riderId) || !isFilled(from) || !isFilled(to)) {
        response.status(400).json({ error: "riderId, from and to are required" });
        return null;
    }

    if (uberX !== undefined && typeof uberX !== "boolean") {
        response.status(400).json({ error: "uberX must be a boolean" });
        return null;
    }

    return { riderId, from, to, uberX: uberX ?? false };
}

export function isFilled(value: unknown): value is string {
    return typeof value === "string" && value.trim() !== "";
}
