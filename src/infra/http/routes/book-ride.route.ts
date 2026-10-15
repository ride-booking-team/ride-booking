import type { Request, Response } from "express";
import type { BookRideUseCase } from "../../../application/use-cases/book-ride.usecase.js";
import { isFilled, readRideRequest } from "../validation.js";

export function bookRideRoute(bookRide: BookRideUseCase) {
    return async (request: Request, response: Response): Promise<void> => {
        const { riderId, token } = request.body ?? {};

        // Avec un token : on réserve au prix garanti de l'estimation.
        if (token !== undefined) {
            if (!isFilled(riderId) || !isFilled(token)) {
                response.status(400).json({ error: "riderId and token are required" });
                return;
            }

            response.status(201).json(await bookRide.execute({ riderId, token }));
            return;
        }

        const ride = readRideRequest(request.body, response);

        if (!ride) {
            return;
        }

        const booking = await bookRide.execute(ride);

        response.status(201).json(booking);
    };
}
