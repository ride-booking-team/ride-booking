import type { Express } from "express";
import { knex, type Knex } from "knex";

import knexConfig from "../../setup-integration-tests/knexfile.js";
import {
    startDockerPostgresql,
    stopDockerPostgresql,
} from "../../setup-integration-tests/docker-postgresql-manager.js";

import { buildApp } from "../../src/infra/http/build-app.js";
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

    const app = buildApp({
        knex: connection,
        routeScanner,
        dateProvider,
        idGenerator: new CryptoIdGenerator(),
        quoteRepository: new InMemoryPriceQuoteRepository(),
    });

    return { app, knex: connection, routeScanner, dateProvider };
}

export async function stopTestApp(testApp: TestApp | undefined): Promise<void> {
    await testApp?.knex.destroy();
    await stopDockerPostgresql();
}
