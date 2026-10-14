import { describe, it, expect, beforeEach } from "vitest";

describe("CalculatePriceUsecase", () => {

    let calculPriceUsecase: CalculatePriceUsecase;

    beforeEach(() => {
        calculPriceUsecase = new CalculatePriceUsecase();
    });

    it("should return 1", () => {
        expect(calculPriceUsecase.execute()).toBe(1);
    });

    it("should return 2 for Paris to Paris", () => {
        expect(calculPriceUsecase.execute("Paris", "Paris")).toBe(2);
    });

    it("should return 0 for a ride from outside Paris to Paris", () => {
        expect(calculPriceUsecase.execute("outsideParis", "Paris")).toBe(0);
    });

    it("should return 10 for a ride from Paris to outside Paris", () => {
        expect(calculPriceUsecase.execute("Paris", "outsideParis")).toBe(10);
    });

});
export class CalculatePriceUsecase {
    execute(departure?: string, destination?: string): number {
        if (departure === "Paris" && destination === "Paris") {
            return 2;
        }
        if (departure === "outsideParis" && destination === "Paris") {
            return 0;
        }
        if (departure === "Paris" && destination === "outsideParis") {
            return 10;
        }
        return 1;
    }
}