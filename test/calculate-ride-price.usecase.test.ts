import { describe, it, expect, beforeEach } from "vitest";
import { CalculatePriceUsecase } from "../src/application/use-cases/calculate-price.usecase.js";
import { StubDateProvider } from "./stub-date.provider.js";
import { RiderBuilder } from "./builders/rider.builder.js";

describe("CalculatePriceUsecase", () => {
    let calculPriceUsecase: CalculatePriceUsecase;
    let dateProvider: StubDateProvider;
    const parisToParis10km = {
            id: "ride-1",
            departure: "Paris",
            destination: "Paris",
            distanceKm: 10,
          };

    beforeEach(() => {
        dateProvider = new StubDateProvider();
        calculPriceUsecase = new CalculatePriceUsecase(dateProvider);
    });

    it("should return 2 for Paris to Paris", () => {
        expect(
            calculPriceUsecase.execute({
                id: "ride-1",
                departure: "Paris",
                destination: "Paris",
                distanceKm: 0,
            })
        ).toBe(2);
    });

    it("should return 0 for a ride from outside Paris to Paris", () => {
        expect(
            calculPriceUsecase.execute({
                id: "ride-1",
                departure: "outsideParis",
                destination: "Paris",
                distanceKm: 0,
            })
        ).toBe(0);
    });

    it("should return 10 for a ride from Paris to outside Paris", () => {
        expect(
            calculPriceUsecase.execute({
                id: "ride-1",
                departure: "Paris",
                destination: "outsideParis",
                distanceKm: 0,
            })
        ).toBe(10);
    });

    it("should return 7 for a 10 km ride from Paris to Paris", () => {
        expect(
            calculPriceUsecase.execute({
                id: "ride-1",
                departure: "Paris",
                destination: "Paris",
                distanceKm: 10,
            })
        ).toBe(7);
    });

     it("should double the price on Christmas day", () => {
          dateProvider.date = new Date("2026-12-25T15:00:00Z");

          expect(
              calculPriceUsecase.execute({
                  id: "ride-1",
                  departure: "Paris",
                  destination: "Paris",
                  distanceKm: 10,
              })
          ).toBe(14);
      });
  
      it("should not double the price on Christmas Eve", () => {
          dateProvider.date = new Date("2026-12-24T20:00:00Z");

          expect(
              calculPriceUsecase.execute({
                  id: "ride-1",
                  departure: "Paris",
                  destination: "Paris",
                  distanceKm: 10,
              })
          ).toBe(7);
      });

      it("should not double the price the day after Christmas", () => {
          dateProvider.date = new Date("2026-12-26T00:00:00Z");

          expect(
              calculPriceUsecase.execute({
                  id: "ride-1",
                  departure: "Paris",
                  destination: "Paris",
                  distanceKm: 10,
              })
          ).toBe(7);
      });

       it("should offer the UberX supplement on the rider's birthday, even on Christmas day", () => {
          dateProvider.date = new Date("2026-12-25T15:00:00Z");
          const rider = new RiderBuilder().withBirthDate(new Date("2000-12-25")).build();

          expect(calculPriceUsecase.execute(parisToParis10km, { uberX: true, rider })).toBe(14);
      });

      it("should add 5 euros to an UberX ride leaving Paris", () => {
          const rider = new RiderBuilder().withBirthDate(new Date("2000-01-01")).build();

          expect(
              calculPriceUsecase.execute(
                  { id: "ride-1", departure: "Paris", destination: "Lyon", distanceKm: 20 },
                  { uberX: true, rider },
              )
          ).toBe(25);
      });

      it("should add 50% during the morning rush hour", () => {
          dateProvider.date = new Date("2026-10-14T06:30:00Z");   

          expect(calculPriceUsecase.execute(parisToParis10km)).toBe(10.5);   
      });

      it("should add 50% during the evening rush hour", () => {
          dateProvider.date = new Date("2026-10-14T17:30:00Z");   

          expect(calculPriceUsecase.execute(parisToParis10km)).toBe(10.5);
      });

      it("should not add 50% at 9:00 sharp", () => {
          dateProvider.date = new Date("2026-10-14T07:00:00Z");   

          expect(calculPriceUsecase.execute(parisToParis10km)).toBe(7);
      });

      it("should not add 50% at 20:00 sharp", () => {
          dateProvider.date = new Date("2026-10-14T18:00:00Z");   

          expect(calculPriceUsecase.execute(parisToParis10km)).toBe(7);
      });

      it("should combine rush hour with Christmas and UberX", () => {
          dateProvider.date = new Date("2026-12-25T07:30:00Z");   
          const rider = new RiderBuilder().withBirthDate(new Date("2000-01-01")).build();

          expect(calculPriceUsecase.execute(parisToParis10km, { uberX: true, rider })).toBe(26);
      });

});