import { describe, it, expect, beforeEach } from "vitest";
import { CalculatePriceUsecase } from "../src/calculate-price.usecase.js";

describe("CalculatePriceUsecase", () => {
    let calculPriceUsecase: CalculatePriceUsecase;

    beforeEach(() => {
        calculPriceUsecase = new CalculatePriceUsecase();
    });

    it("should return 2 for Paris to Paris", () => {
        expect(
            calculPriceUsecase.execute({
                departure: "Paris",
                destination: "Paris",
                distanceKm: 0,
            })
        ).toBe(2);
    });

    it("should return 0 for a ride from outside Paris to Paris", () => {
        expect(
            calculPriceUsecase.execute({
                departure: "outsideParis",
                destination: "Paris",
                distanceKm: 0,
            })
        ).toBe(0);
    });

    it("should return 10 for a ride from Paris to outside Paris", () => {
        expect(
            calculPriceUsecase.execute({
                departure: "Paris",
                destination: "outsideParis",
                distanceKm: 0,
            })
        ).toBe(10);
    });

    it("should return 7 for a 10 km ride from Paris to Paris", () => {
        expect(
            calculPriceUsecase.execute({
                departure: "Paris",
                destination: "Paris",
                distanceKm: 10,
            })
        ).toBe(7);
    });
});