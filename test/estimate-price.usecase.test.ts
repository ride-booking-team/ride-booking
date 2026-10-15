import { describe, it, expect, beforeEach } from "vitest";
import { EstimatePriceUseCase } from "../src/application/use-cases/estimate-price.usecase.js";
import { CalculatePriceUsecase } from "../src/application/use-cases/calculate-price.usecase.js";
import { FakeRiderRepository } from "./fakes/fake-rider.repository.js";
import { FakeRouteScanner } from "./fakes/fake-route-scanner.js";
import { StubDateProvider } from "./stub-date.provider.js";
import { StubIDGenerator } from "./stub-id-generator.provider.js";
import { RiderBuilder } from "./builders/rider.builder.js";
import { InMemoryPriceQuoteRepository } from "../src/infra/in-memory-price-quote.repository.js";

describe("EstimatePriceUseCase", () => {
    let estimatePrice: EstimatePriceUseCase;
    let riderRepository: FakeRiderRepository;
    let routeScanner: FakeRouteScanner;
    let dateProvider: StubDateProvider;
    let idGenerator: StubIDGenerator;
    let quoteRepository: InMemoryPriceQuoteRepository;

    const FROM = "10 rue de Rivoli";
    const TO = "5 avenue Foch";

    beforeEach(async () => {
        riderRepository = new FakeRiderRepository();
        routeScanner = new FakeRouteScanner();
        dateProvider = new StubDateProvider();
        idGenerator = new StubIDGenerator();
        quoteRepository = new InMemoryPriceQuoteRepository();

        estimatePrice = new EstimatePriceUseCase(
            new CalculatePriceUsecase(dateProvider),
            idGenerator,
            riderRepository,
            routeScanner,
            dateProvider,
            quoteRepository,
        );

        await riderRepository.save(
            new RiderBuilder().withId("rider-1").withBirthDate(new Date("2000-01-01")).build(),
        );
        routeScanner.withRoute(FROM, TO, {
            departureCity: "Paris",
            destinationCity: "Paris",
            distanceKm: 10,
        });
    });

    it("should estimate the price with every modifier", async () => {
        dateProvider.date = new Date("2026-12-25T15:00:00Z"); // Noël, 16h à Paris

        const estimate = await estimatePrice.execute({
            riderId: "rider-1",
            from: FROM,
            to: TO,
            uberX: true,
        });

        expect(estimate?.price).toBe(19); // 7 € × 2 (Noël) + 5 € (UberX)
    });

    it("should give a token valid for 5 minutes and keep the quote", async () => {
        dateProvider.date = new Date("2026-10-15T10:00:00Z");
        idGenerator.id = "token-1";

        const estimate = await estimatePrice.execute({ riderId: "rider-1", from: FROM, to: TO });

        expect(estimate).toEqual({
            token: "token-1",
            price: 7,
            expiresAt: new Date("2026-10-15T10:05:00Z"),
        });
        expect((await quoteRepository.findByToken("token-1"))?.price).toBe(7);
    });

    it("should not estimate for an unknown rider", async () => {
        const estimate = await estimatePrice.execute({ riderId: "unknown", from: FROM, to: TO });

        expect(estimate).toBeNull();
    });
});