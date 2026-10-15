
import { describe, it, expect, beforeEach } from "vitest";
import { BookingBuilder } from "./builders/booking.builder.js";
import { RiderBuilder } from "./builders/rider.builder.js";
import { CalculatePriceUsecase } from "../src/application/use-cases/calculate-price.usecase.js";
import { BookRideUseCase } from "../src/application/use-cases/book-ride.usecase.js";
import { FakeBookingRepository } from "./fakes/fake-booking.repository.js";
import { FakeRiderRepository } from "./fakes/fake-rider.repository.js";
import { StubIDGenerator } from "./stub-id-generator.provider.js";
import { BookingStatus } from "../src/domain/value-objects/booking-status.js";
import { StubDateProvider } from "./stub-date.provider.js";
import { FakeRouteScanner } from "./fakes/fake-route-scanner.js";
import { AddressNotFoundError } from "../src/domain/errors/address-not-found-error.js";
import { InMemoryPriceQuoteRepository } from "../src/infra/in-memory-price-quote.repository.js";
import { PriceQuote } from "../src/domain/models/price-quote.js";
import { QuoteExpiredError } from "../src/domain/errors/quote-expired-error.js";
import { UnknownQuoteError } from "../src/domain/errors/unknown-quote-error.js";
import { QuoteAlreadyUsedError } from "../src/domain/errors/quote-already-used-error.js";

describe("BookRideUseCase", () => {
    let calculatePriceUsecase: CalculatePriceUsecase;
    let bookRideUseCase: BookRideUseCase;
    let fakeBookingRepository: FakeBookingRepository;
    let fakeRiderRepository: FakeRiderRepository;
    let idGenerator: StubIDGenerator;
    let dateProvider: StubDateProvider;
    let fakeRouteScanner: FakeRouteScanner;
    let quoteRepository: InMemoryPriceQuoteRepository;

    beforeEach(() => {
        dateProvider = new StubDateProvider();
        calculatePriceUsecase = new CalculatePriceUsecase(dateProvider);
        fakeBookingRepository = new FakeBookingRepository();
        fakeRiderRepository = new FakeRiderRepository();
        fakeRouteScanner = new FakeRouteScanner();
        idGenerator = new StubIDGenerator();
        quoteRepository = new InMemoryPriceQuoteRepository();

        bookRideUseCase = new BookRideUseCase(
            calculatePriceUsecase,
            idGenerator,
            fakeBookingRepository,
            fakeRiderRepository,
            fakeRouteScanner,
            quoteRepository,
            dateProvider,
        );
    });

    const FROM = "10 rue de Rivoli";
    const TO = "5 avenue Foch";

    function aRouteInParis(distanceKm = 10): { from: string, to: string } {
        fakeRouteScanner.withRoute(FROM, TO, {
            departureCity: "Paris",
            destinationCity: "Paris",
            distanceKm,
        });

        return { from: FROM, to: TO };
    };

    it("should reject a ride when the rider has insufficient balance", async () => {
        const rider = new RiderBuilder().withBalance(1).build();

        await fakeRiderRepository.save(rider);

        const result = await bookRideUseCase.execute({
            riderId: rider.id,
            ...aRouteInParis(),
        });

        expect(result).toBeNull();
    });

    it("should create a booking when the rider has sufficient balance", async () => {
        const rider = new RiderBuilder().withBalance(15).build();

        await fakeRiderRepository.save(rider);

        const result = await bookRideUseCase.execute({
            riderId: rider.id,
            ...aRouteInParis(),
        });

        expect(result).not.toBeNull();
    });

    it("should return an id when we create a booking ", async () => {
        const rider = new RiderBuilder().withBalance(10).build();

        await fakeRiderRepository.save(rider);
        idGenerator.id = "booking-1";

        const result = await bookRideUseCase.execute({
            riderId: rider.id,
            ...aRouteInParis(),
        });

        expect(result).toEqual({ id: "booking-1" });
    });

    it("should reject booking when the rider already has a pending booking", async () => {
        const rider = new RiderBuilder().build();

        await fakeRiderRepository.save(rider);

        const existingBooking = new BookingBuilder()
            .withRiderId(rider.id)
            .withStatus("pending")
            .build();

        await fakeBookingRepository.save(existingBooking);

        const result = await bookRideUseCase.execute({
            riderId: rider.id,
            ...aRouteInParis(),
        });

        expect(result).toBeNull();
    });

    it("should save the newly created booking", async () => {
        const rider = new RiderBuilder().build();

        await fakeRiderRepository.save(rider);
        idGenerator.id = "booking-1";

        const result = await bookRideUseCase.execute({
            riderId: rider.id,
            ...aRouteInParis(),
        });

        expect(result).not.toBeNull();

        const savedBookings =
            await fakeBookingRepository.findByRiderId(rider.id);

        expect(savedBookings).toHaveLength(1);
        expect(savedBookings[0]).toMatchObject({
            id: result!.id,
            riderId: rider.id,
            ride: { departure: "Paris", destination: "Paris", distanceKm: 10 },
            status: BookingStatus.PENDING,
        });
    });

    it("should reject another booking when no driver is assigned", async () => {
        const rider = new RiderBuilder().build();

        await fakeRiderRepository.save(rider);

        const existingBooking = new BookingBuilder()
            .withRiderId(rider.id)
            .withStatus("pending")
            .build();

        await fakeBookingRepository.save(existingBooking);

        const result = await bookRideUseCase.execute({
            riderId: rider.id,
            ...aRouteInParis(),
        });

        expect(result).toBeNull();
    });

    it("should allow another booking when a driver is assigned", async () => {
        const rider = new RiderBuilder().build();

        await fakeRiderRepository.save(rider);

        const existingBooking = new BookingBuilder()
            .withRiderId(rider.id)
            .withStatus("pending")
            .withDriverId("driver-1")
            .build();

        await fakeBookingRepository.save(existingBooking);

        idGenerator.id = "booking-1";

        const result = await bookRideUseCase.execute({
            riderId: rider.id,
            ...aRouteInParis(),
        });

        expect(result).toEqual({ id: "booking-1" });
    });

    it("should reject an UberX ride the rider cannot afford", async () => {
        const rider = new RiderBuilder()
            .withBalance(10)
            .withBirthDate(new Date("2000-01-01"))
            .build();
        await fakeRiderRepository.save(rider);

        const result = await bookRideUseCase.execute({
            riderId: rider.id,
            ...aRouteInParis(10),
            uberX: true,
        });

        expect(result).toBeNull();
    });

    it("should accept the same UberX ride on the rider's birthday", async () => {
        const rider = new RiderBuilder()
            .withBalance(10)
            .withBirthDate(new Date("2000-10-14"))
            .build();
        await fakeRiderRepository.save(rider);

        const result = await bookRideUseCase.execute({
            riderId: rider.id,
            ...aRouteInParis(10),
            uberX: true,
        });

        expect(result).not.toBeNull();
    });

    it("should price the ride with the distance and cities given by the scanner", async () => {
        fakeRouteScanner.withRoute("10 rue de la rivoli", "5 avenue Foch", {
            departureCity: "Paris",
            destinationCity: "Paris",
            distanceKm: 10,
        });

        const rider = new RiderBuilder().withBalance(7).build();
        await fakeRiderRepository.save(rider);
        idGenerator.id = "booking-1";

        const result = await bookRideUseCase.execute({
            riderId: rider.id,
            from: "10 rue de la rivoli",
            to: "5 avenue Foch",
        });

        expect(result).toEqual({ id: "booking-1" });
    });

    it("should save the booking with the cities and distance given by the scanner", async () => {
        fakeRouteScanner.withRoute("Tour Eiffel", "Place Bellecour", {
            departureCity: "Paris",
            destinationCity: "Lyon",
            distanceKm: 460,
        });
        const rider = new RiderBuilder().withBalance(240).build();
        await fakeRiderRepository.save(rider);

        await bookRideUseCase.execute({
            riderId: rider.id,
            from: "Tour Eiffel",
            to: "Place Bellecour",
        });

        const [saved] = await fakeBookingRepository.findByRiderId(rider.id);
        expect(saved?.ride).toMatchObject({
            departure: "Paris",
            destination: "Lyon",
            distanceKm: 460,
        });
    });

    it("should not book when an address cannot be found", async () => {
        const rider = new RiderBuilder().build();
        await fakeRiderRepository.save(rider);

        await expect(
            bookRideUseCase.execute({
                riderId: rider.id,
                from: "nowhere",
                to: "5 avenue Foch",
            }),
        ).rejects.toThrow(AddressNotFoundError);

        expect(await fakeBookingRepository.findByRiderId(rider.id)).toEqual([]);
    });

    it("should book at the guaranteed price of a valid token, even if the price went up", async () => {
        const rider = new RiderBuilder().withBalance(8).build();
        await fakeRiderRepository.save(rider);

        // devis fait à 7h58 à Paris : 7 € (pas encore l'heure de pointe)
        await quoteRepository.save(PriceQuote.create({
            token: "token-1",
            riderId: rider.id,
            ride: { id: "ride-1", departure: "Paris", destination: "Paris", distanceKm: 10 },
            uberX: false,
            price: 7,
            now: new Date("2026-10-15T05:58:00Z"),
        }));

        // réservation à 8h01 à Paris : l'heure de pointe a commencé, le prix serait 10,50 €
        dateProvider.date = new Date("2026-10-15T06:01:00Z");
        idGenerator.id = "booking-1";

        const result = await bookRideUseCase.execute({ riderId: rider.id, token: "token-1" });

        expect(result).toEqual({ id: "booking-1" }); // 7 € ≤ 8 € → réservé au prix garanti
        const [saved] = await fakeBookingRepository.findByRiderId(rider.id);
        expect(saved?.ride).toEqual({ id: "ride-1", departure: "Paris", destination: "Paris", distanceKm: 10 });
    });

    it("should keep the estimated price in the booking", async () => {
        const rider = new RiderBuilder().withBalance(100).build();
        await fakeRiderRepository.save(rider);

        await quoteRepository.save(PriceQuote.create({
            token: "token-1",
            riderId: rider.id,
            ride: { id: "ride-1", departure: "Paris", destination: "Paris", distanceKm: 10 },
            uberX: true,
            price: 19,
            now: dateProvider.now(),
        }));

        await bookRideUseCase.execute({ riderId: rider.id, token: "token-1" });

        const [saved] = await fakeBookingRepository.findByRiderId(rider.id);
        expect(saved?.price).toBe(19);
    });

    it("should not book with an expired token", async () => {
        const rider = new RiderBuilder().withBalance(100).build();
        await fakeRiderRepository.save(rider);

        await quoteRepository.save(PriceQuote.create({
            token: "token-1",
            riderId: rider.id,
            ride: { id: "ride-1", departure: "Paris", destination: "Paris", distanceKm: 10 },
            uberX: false,
            price: 7,
            now: new Date("2026-10-15T10:00:00Z"),
        }));

        dateProvider.date = new Date("2026-10-15T10:06:00Z"); // 6 minutes plus tard

        await expect(
            bookRideUseCase.execute({ riderId: rider.id, token: "token-1" }),
        ).rejects.toThrow(QuoteExpiredError);

        expect(await fakeBookingRepository.findByRiderId(rider.id)).toEqual([]);
    });

    it("should not book with an unknown token", async () => {
        const rider = new RiderBuilder().withBalance(100).build();
        await fakeRiderRepository.save(rider);

        await expect(
            bookRideUseCase.execute({ riderId: rider.id, token: "unknown-token" }),
        ).rejects.toThrow(UnknownQuoteError);
    });

    it("should not book twice with the same token", async () => {
        const rider = new RiderBuilder().withBalance(100).build();
        await fakeRiderRepository.save(rider);

        await quoteRepository.save(PriceQuote.create({
            token: "token-1",
            riderId: rider.id,
            ride: { id: "ride-1", departure: "Paris", destination: "Paris", distanceKm: 10 },
            uberX: false,
            price: 7,
            now: dateProvider.now(),
        }));

        await bookRideUseCase.execute({ riderId: rider.id, token: "token-1" });

        await expect(
            bookRideUseCase.execute({ riderId: rider.id, token: "token-1" }),
        ).rejects.toThrow(QuoteAlreadyUsedError);
    });

    it("should not book with the token of another rider", async () => {
        const otherRider = new RiderBuilder().withId("rider-2").withBalance(100).build();
        await fakeRiderRepository.save(otherRider);

        await quoteRepository.save(PriceQuote.create({
            token: "token-1",
            riderId: "rider-1",
            ride: { id: "ride-1", departure: "Paris", destination: "Paris", distanceKm: 10 },
            uberX: false,
            price: 7,
            now: dateProvider.now(),
        }));

        await expect(
            bookRideUseCase.execute({ riderId: "rider-2", token: "token-1" }),
        ).rejects.toThrow(UnknownQuoteError);

        expect(await fakeBookingRepository.findByRiderId("rider-2")).toEqual([]);
    });

});
