import express, { type Express } from "express";

import type { BookRideUseCase } from "../../application/use-cases/book-ride.usecase.js";
import type { CancelRideUseCase } from "../../application/use-cases/cancel-ride.usecase.js";
import type { EstimatePriceUseCase } from "../../application/use-cases/estimate-price.usecase.js";
import type { ListRideHistoryUseCase } from "../../application/use-cases/list-ride-history.usecase.js";
import { errorHandler } from "./error-handler.js";
import { bookRideRoute } from "./routes/book-ride.route.js";
import { cancelRideRoute } from "./routes/cancel-ride.route.js";

/**
 * L'API ne connaît que les use cases :
 * c'est l'appelant (server.ts ou les tests e2e) qui choisit ce qu'il y a derrière.
 */
export type AppDependencies = {
    bookRide: BookRideUseCase;
    cancelRide: CancelRideUseCase;
    listRideHistory: ListRideHistoryUseCase;
    estimatePrice: EstimatePriceUseCase;
};

export function createApp(deps: AppDependencies): Express {
    const app = express();

    app.use(express.json());

    app.post("/rides/book", bookRideRoute(deps.bookRide));
    app.post("/rides/:bookingId/cancel", cancelRideRoute(deps.cancelRide));

    app.use((_request, response) => {
        response.status(404).json({ error: "route not found" });
    });

    app.use(errorHandler);

    return app;
}
