import type { Express } from "express";
import type { Knex } from "knex";

import { BookRideUseCase } from "../../application/use-cases/book-ride.usecase.js";
import { CalculatePriceUsecase } from "../../application/use-cases/calculate-price.usecase.js";
import { CancelRideUseCase } from "../../application/use-cases/cancel-ride.usecase.js";
import { EstimatePriceUseCase } from "../../application/use-cases/estimate-price.usecase.js";
import { ListRideHistoryUseCase } from "../../application/use-cases/list-ride-history.usecase.js";
import type { DateProvider } from "../../domain/ports/date.provider.js";
import type { IDGenerator } from "../../domain/ports/id-generator.provider.js";
import type { PriceQuoteRepository } from "../../domain/ports/price-quote.repository.js";
import type { RouteScanner } from "../../domain/ports/route.scanner.js";
import { KnexBookingRepository } from "../knex-booking.repository.js";
import { KnexDriverRepository } from "../knex-driver.repository.js";
import { KnexRiderRepository } from "../knex-rider.repository.js";
import { createApp } from "./app.js";

export type Adapters = {
    knex: Knex;
    routeScanner: RouteScanner;
    dateProvider: DateProvider;
    idGenerator: IDGenerator;
    quoteRepository: PriceQuoteRepository;
};

/**
 * Branche les use cases sur les adapters.
 * Le serveur et les tests e2e passent par ici : seuls les adapters changent.
 */
export function buildApp({ knex, routeScanner, dateProvider, idGenerator, quoteRepository }: Adapters): Express {
    const riders = new KnexRiderRepository(knex);
    const bookings = new KnexBookingRepository(knex);
    const drivers = new KnexDriverRepository(knex);
    const calculatePrice = new CalculatePriceUsecase(dateProvider);

    return createApp({
        bookRide: new BookRideUseCase(
            calculatePrice, idGenerator, bookings, riders, routeScanner, quoteRepository, dateProvider,
        ),
        cancelRide: new CancelRideUseCase(bookings, dateProvider, riders),
        listRideHistory: new ListRideHistoryUseCase(bookings, drivers),
        estimatePrice: new EstimatePriceUseCase(
            calculatePrice, idGenerator, riders, routeScanner, dateProvider, quoteRepository,
        ),
    });
}
