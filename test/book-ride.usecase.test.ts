
import { describe, it, expect, beforeEach } from "vitest";
import { BookingBuilder } from "./builders/booking.builder.js";
import { RiderBuilder } from "./builders/rider.builder.js";
import { RideBuilder } from "./builders/ride.builder.js";
import { CalculatePriceUsecase } from "../src/application/use-cases/calculate-price.usecase.js";
import { BookRideUseCase } from "../src/application/use-cases/book-ride.usecase.js";
import { FakeBookingRepository } from "./fakes/fake-booking.repository.js";
import { FakeRiderRepository } from "./fakes/fake-rider.repository.js";
import { StubIDGenerator } from "./stub-id-generator.provider.js";
import { BookingStatus } from "../src/domain/value-objects/booking-status.js";
import { StubDateProvider } from "./stub-date.provider.js";
import { FakeRouteScanner } from "./fakes/fake-route-scanner.js";

describe("BookRideUseCase", () => {
    let calculatePriceUsecase: CalculatePriceUsecase;
    let bookRideUseCase: BookRideUseCase;
    let fakeBookingRepository: FakeBookingRepository;
    let fakeRiderRepository: FakeRiderRepository;
    let idGenerator: StubIDGenerator;
    let dateProvider: StubDateProvider;
    let fakeRouteScanner: FakeRouteScanner;

    beforeEach(() => {
        dateProvider = new StubDateProvider();
        calculatePriceUsecase = new CalculatePriceUsecase(dateProvider);
        fakeBookingRepository = new FakeBookingRepository();
        fakeRiderRepository = new FakeRiderRepository();
        fakeRouteScanner = new FakeRouteScanner();
        idGenerator = new StubIDGenerator();

        bookRideUseCase = new BookRideUseCase(
            calculatePriceUsecase,
            idGenerator,
            fakeBookingRepository,
            fakeRiderRepository,
            fakeRouteScanner,
        );
    });

    const FROM = "10 rue de Rivoli";
    const TO = "5 avenue Foch";

    function aRouteInParis(distanceKm = 10): {from: string, to: string} {
        fakeRouteScanner.withRoute(FROM, TO, {
            departureCity: "Paris",
            destinationCity: "Paris",
            distanceKm,
          });

        return {from: FROM, to: TO};
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
        const ride = new RideBuilder().build();

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
              ...aRouteInParis(),   
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
              ...aRouteInParis(),
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

          expect(result).toEqual({ id: "booking-1"});
      });

});
