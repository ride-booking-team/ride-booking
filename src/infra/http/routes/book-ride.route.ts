import type { Request, Response } from "express";
import type { BookRideUseCase } from "../../../application/use-cases/book-ride.usecase.js";
import { readRideRequest } from "../validation.js";

export function bookRideRoute(bookRide: BookRideUseCase) {
    return async (request: Request, response: Response): Promise<void> => {
        const ride = readRideRequest(request.body, response);

        if (!ride) {
            return;
        }

        const booking = await bookRide.execute(ride);

        response.status(201).json(booking);
    };
}
