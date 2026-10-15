# ride-booking

A ride-booking API (an Uber-like project): riders estimate a price, book a ride, cancel it, and list their history.

## Prerequisites

- **Node.js ≥ 22.18**: Knex loads the TypeScript migrations directly with Node.
- **Docker**: the integration and e2e tests start their own PostgreSQL, and the app uses a dev PostgreSQL.
- **A Google Maps API key** with the **Geocoding API** and the **Routes API** enabled. You only need it to run the app or the Google integration tests.

```bash
npm install
cp .env.example .env    # then put your key in GOOGLE_MAPS_API_KEY
```

| Variable | Used by | Default |
|---|---|---|
| `GOOGLE_MAPS_API_KEY` | the app, Google integration tests | — |
| `PORT` | the app | `3000` |
| `NODE_ENV` | the app: `production` uses `DATABASE_URL` | `development` |
| `DATABASE_URL` | the app in production | — |

`.env` is ignored by Git: never commit your key.

## Running the tests

Vitest runs in **watch mode** by default. Add `-- --run` to run the tests once and exit.

| Tests | Command | Needs | What they cover |
|---|---|---|---|
| Unit | `npm test` | nothing | domain and use cases, with fakes and stubs (`*.test.ts`) |
| Integration | `npm run test:integration` | Docker | Knex repositories on a real PostgreSQL, Google adapter on the real API (`*.it-spec.ts`) |
| End-to-end | `npm run test:e2e` | Docker | the HTTP API with supertest, on a real PostgreSQL (`*.e2e-spec.ts`) |

```bash
npm test -- --run
npm run test:integration -- --run
npm run test:e2e -- --run

# a single file
npm run test:e2e -- --run test/e2e/book-ride.e2e-spec.ts
```

- **The integration and e2e tests start PostgreSQL in Docker on port `5433`**, run the migrations, and stop it at the end. Docker Desktop must be running.
- **The Google integration tests are skipped when `GOOGLE_MAPS_API_KEY` isn't set.**
- **The e2e tests never call Google:** they use a fake route scanner, and a stub clock so prices are predictable.

## Running the app

### 1. Start the dev database

```bash
npm run db:dev
```

This starts PostgreSQL in Docker on port **`5434`** (container `ride-booking-dev-db`), with a volume so the data survives restarts. Port `5433` is kept for the tests.

### 2. Run the migrations

```bash
npm run knex migrate:latest
```

### 3. Start the API

```bash
npm start
```

The API listens on `http://localhost:3000`, or on `PORT`. Stop it with `Ctrl+C`.

No endpoint creates riders yet, so add one directly in the database:

```bash
docker exec ride-booking-dev-db psql -U postgres -d ride_booking \
  -c "INSERT INTO riders (id, balance, birth_date) VALUES ('rider-1', 500, '2000-01-01');"
```

To stop the database: `docker stop ride-booking-dev-db`.

## Migrations

The migrations are in `setup-integration-tests/migrations/`, and the Knex config is in `setup-integration-tests/knexfile.ts`.

| Action | Command |
|---|---|
| Create a migration | `npm run knex migrate:make <migration_name>` |
| Apply the pending migrations | `npm run knex migrate:latest` |
| Undo the last batch | `npm run knex migrate:rollback` |
| See which migrations ran | `npm run knex migrate:status` |

These commands use the **dev** database (`development`). The tests apply the migrations to their own database on their own.

## API

| Method | Route | Body | Success |
|---|---|---|---|
| `POST` | `/rides/estimate` | `{ riderId, from, to, uberX? }` | `200 { token, price, expiresAt }` |
| `POST` | `/rides/book` | `{ riderId, token }` or `{ riderId, from, to, uberX? }` | `201 { id }` |
| `POST` | `/rides/:bookingId/cancel` | — | `200 { penalty }` |
| `GET` | `/riders/:riderId/rides` | — | `200 { totalRides, rides }` |

An estimate's token guarantees its price for **5 minutes** and can only be used **once**. When the body has a `token`, any `from`/`to` are ignored.

Errors always look like `{ "error": "<message>" }`:

| Code | When |
|---|---|
| `400` | missing or invalid field, or body that isn't JSON |
| `402` | the rider can't pay the ride |
| `404` | unknown rider, booking or token |
| `409` | a booking is already waiting for a driver, booking already cancelled, or token already used |
| `410` | expired token |
| `422` | unknown address, or no road between the two addresses |

```bash
curl -X POST localhost:3000/rides/estimate -H "Content-Type: application/json" \
  -d '{"riderId":"rider-1","from":"10 rue de Rivoli, Paris","to":"Place Bellecour, Lyon"}'

curl -X POST localhost:3000/rides/book -H "Content-Type: application/json" \
  -d '{"riderId":"rider-1","token":"<token from the estimate>"}'
```

## Project structure

```
src/
  domain/         models, value objects, errors and ports (interfaces), with no dependency on infra
  application/    use cases
  infra/          adapters: Knex repositories, Google Maps, providers, HTTP API (Express)
  server.ts       composition root: wires the real adapters and starts the server
test/
  *.test.ts       unit tests
  integration/    integration tests (*.it-spec.ts)
  e2e/            end-to-end tests (*.e2e-spec.ts)
  fakes/, builders/, contracts/
```
