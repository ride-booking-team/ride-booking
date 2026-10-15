import type { Request, Response } from "express";
import type { CancelRideUseCase } from "../../../application/use-cases/cancel-ride.usecase.js";

export function cancelRideRoute(cancelRide: CancelRideUseCase) {
    return async (request: Request<{ bookingId: string }>, response: Response): Promise<void> => {
        const result = await cancelRide.execute({ bookingId: request.params.bookingId });

        response.status(200).json(result);
    };
}
