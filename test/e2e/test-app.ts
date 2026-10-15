import type { Express } from "express";
import { knex, type Knex } from "knex";

import knexConfig from "../../setup-integration-tests/knexfile.js";
import {
    startDockerPostgresql,
    stopDockerPostgresql,
} from "../../setup-integration-tests/docker-postgresql-manager.js";

import { createApp } from "../../src/infra/http/app.js";
import { BookRideUseCase } from "../../src/application/use-cases/book-ride.usecase.js";
import { CalculatePriceUsecase } from "../../src/application/use-cases/calculate-price.usecase.js";
import { CancelRideUseCase } from "../../src/application/use-cases/cancel-ride.usecase.js";
import { EstimatePriceUseCase } from "../../src/application/use-cases/estimate-price.usecase.js";
import { ListRideHistoryUseCase } from "../../src/application/use-cases/list-ride-history.usecase.js";
import { KnexBookingRepository } from "../../src/infra/knex-booking.repository.js";
import { KnexDriverRepository } from "../../src/infra/knex-driver.repository.js";
import { KnexRiderRepository } from "../../src/infra/knex-rider.repository.js";
import { InMemoryPriceQuoteRepository } from "../../src/infra/in-memory-price-quote.repository.js";
import { CryptoIdGenerator } from "../../src/infra/crypto-id-generator.provider.js";
import { FakeRouteScanner } from "../fakes/fake-route-scanner.js";
import { StubDateProvider } from "../stub-date.provider.js";

export type TestApp = {
    app: Express;
    knex: Knex;
    routeScanner: FakeRouteScanner;
    dateProvider: StubDateProvider;
};

/**
 * L'application complète sur une vraie base Postgres,
 * sans Google (FakeRouteScanner) et avec une horloge maîtrisée (StubDateProvider).
 */
export async function startTestApp(): Promise<TestApp> {
    await startDockerPostgresql();

    const connection = knex(knexConfig.test);
    const routeScanner = new FakeRouteScanner();
    const dateProvider = new StubDateProvider();
    const idGenerator = new CryptoIdGenerator();

    const riders = new KnexRiderRepository(connection);
    const bookings = new KnexBookingRepository(connection);
    const drivers = new KnexDriverRepository(connection);
    const quotes = new InMemoryPriceQuoteRepository();
    const calculatePrice = new CalculatePriceUsecase(dateProvider);

    const app = createApp({
        bookRide: new BookRideUseCase(
            calculatePrice, idGenerator, bookings, riders, routeScanner, quotes, dateProvider,
        ),
        cancelRide: new CancelRideUseCase(bookings, dateProvider, riders),
        listRideHistory: new ListRideHistoryUseCase(bookings, drivers),
        estimatePrice: new EstimatePriceUseCase(
            calculatePrice, idGenerator, riders, routeScanner, dateProvider, quotes,
        ),
    });

    return { app, knex: connection, routeScanner, dateProvider };
}

export async function stopTestApp(testApp: TestApp | undefined): Promise<void> {
    await testApp?.knex.destroy();
    await stopDockerPostgresql();
}
