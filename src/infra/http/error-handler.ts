import type { ErrorRequestHandler } from "express";

import { AddressNotFoundError } from "../../domain/errors/address-not-found-error.js";
import { BookingAlreadyCancelledError } from "../../domain/errors/booking-already-cancelled-error.js";
import { BookingNotFoundError } from "../../domain/errors/booking-not-found-error.js";
import { InsufficientFundsError } from "../../domain/errors/insufficient-funds-error.js";
import { PendingBookingError } from "../../domain/errors/pending-booking-error.js";
import { RiderNotFoundError } from "../../domain/errors/rider-not-found-error.js";
import { RouteNotFoundError } from "../../domain/errors/route-not-found-error.js";

type ErrorClass = new (...args: never[]) => Error;

/**
 * Chaque erreur métier devient un code HTTP.
 * Le message des erreurs métier est fait pour être lu par le client.
 */
const STATUS_BY_ERROR: ReadonlyArray<[ErrorClass, number]> = [
    [RiderNotFoundError, 404],
    [BookingNotFoundError, 404],
    [AddressNotFoundError, 422],
    [RouteNotFoundError, 422],
    [InsufficientFundsError, 402],
    [PendingBookingError, 409],
    [BookingAlreadyCancelledError, 409],
];

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    if (isInvalidJson(error)) {
        response.status(400).json({ error: "request body is not valid JSON" });
        return;
    }

    const status = STATUS_BY_ERROR.find(([errorClass]) => error instanceof errorClass)?.[1];

    if (status === undefined) {
        console.error(error);
        response.status(500).json({ error: "internal error" });
        return;
    }

    response.status(status).json({ error: error.message });
};

// express.json() signale un corps illisible par une erreur de type "entity.parse.failed".
function isInvalidJson(error: unknown): boolean {
    return (error as { type?: unknown } | null)?.type === "entity.parse.failed";
}
