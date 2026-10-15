import knex from "knex";

import knexConfig from "../setup-integration-tests/knexfile.js";
import { buildApp } from "./infra/http/build-app.js";
import { createRouteScanner } from "./infra/create-route-scanner.js";
import { CryptoIdGenerator } from "./infra/crypto-id-generator.provider.js";
import { InMemoryPriceQuoteRepository } from "./infra/in-memory-price-quote.repository.js";
import { SystemDateProvider } from "./infra/system-date.provider.js";

try {
    process.loadEnvFile();
} catch {
    // Pas de .env : on se contente des variables d'environnement déjà définies.
}

const port = Number(process.env.PORT ?? 3000);
const environment = process.env.NODE_ENV === "production" ? "production" : "development";

const connection = knex(knexConfig[environment]);

const app = buildApp({
    knex: connection,
    routeScanner: createRouteScanner(),
    dateProvider: new SystemDateProvider(),
    idGenerator: new CryptoIdGenerator(),
    quoteRepository: new InMemoryPriceQuoteRepository(),
});

const server = app.listen(port, () => {
    console.log(`ride-booking API listening on http://localhost:${port} (${environment})`);
});

async function shutdown(): Promise<void> {
    server.close();
    await connection.destroy();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
