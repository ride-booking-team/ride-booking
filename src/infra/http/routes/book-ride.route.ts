import type { Request, Response } from "express";
import type { BookRideUseCase } from "../../../application/use-cases/book-ride.usecase.js";

export function bookRideRoute(bookRide: BookRideUseCase) {
    return async (request: Request, response: Response): Promise<void> => {
        const { riderId, from, to, uberX } = request.body ?? {};

        if (!isFilled(riderId) || !isFilled(from) || !isFilled(to)) {
            response.status(400).json({ error: "riderId, from and to are required" });
            return;
        }

        if (uberX !== undefined && typeof uberX !== "boolean") {
            response.status(400).json({ error: "uberX must be a boolean" });
            return;
        }

        const booking = await bookRide.execute({ riderId, from, to, uberX: uberX ?? false });

        response.status(201).json(booking);
    };
}

function isFilled(value: unknown): value is string {
    return typeof value === "string" && value.trim() !== "";
}
