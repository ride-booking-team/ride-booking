export type Ride = {
    departure: string;
    destination: string;
    distanceKm: number;
};
export class CalculatePriceUsecase {
    execute(ride: Ride): number {
        const { departure, destination, distanceKm } = ride;

        let basePrice = 1;

        if (departure === "Paris" && destination === "Paris") {
            basePrice = 2;
        } else if (departure !== "Paris" && destination === "Paris") {
            basePrice = 0;
        } else if (departure === "Paris" && destination !== "Paris") {
            basePrice = 10;
        }

        return basePrice + distanceKm * 0.5;
    }
}