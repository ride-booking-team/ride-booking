import type { Request, Response } from "express";
import type { EstimatePriceUseCase } from "../../../application/use-cases/estimate-price.usecase.js";
import { readRideRequest } from "../validation.js";

export function estimatePriceRoute(estimatePrice: EstimatePriceUseCase) {
    return async (request: Request, response: Response): Promise<void> => {
        const ride = readRideRequest(request.body, response);

        if (!ride) {
            return;
        }

        const estimate = await estimatePrice.execute(ride);

        response.status(200).json(estimate);
    };
}
