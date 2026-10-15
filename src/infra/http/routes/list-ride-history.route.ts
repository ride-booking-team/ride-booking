import type { Request, Response } from "express";
import type { ListRideHistoryUseCase } from "../../../application/use-cases/list-ride-history.usecase.js";

export function listRideHistoryRoute(listRideHistory: ListRideHistoryUseCase) {
    return async (request: Request<{ riderId: string }>, response: Response): Promise<void> => {
        const history = await listRideHistory.execute({ riderId: request.params.riderId });

        response.status(200).json(history);
    };
}
