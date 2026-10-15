import type { Ride } from "../models/ride.js";

const UBERX_SUPPLEMENT = 5;

export type PricingOptions = {
    uberX: boolean;
    riderBirthday: boolean;
};

export function calculateRidePrice(
    ride: Ride,
    at: Date,
    { uberX, riderBirthday }: PricingOptions = { uberX: false, riderBirthday: false },
): number {
    const { departure, destination, distanceKm } = ride;

    let basePrice = 1;

    if (departure === "Paris" && destination === "Paris") {
        basePrice = 2;
    } else if (departure !== "Paris" && destination === "Paris") {
        basePrice = 0;
    } else if (departure === "Paris" && destination !== "Paris") {
        basePrice = 10;
    }

    const ridePrice = basePrice + distanceKm * 0.5;
    const priceWithChristmas = isChristmasInParis(at) ? ridePrice * 2 : ridePrice;

    const supplement = uberX && !riderBirthday ? UBERX_SUPPLEMENT : 0;
    return priceWithChristmas + supplement;
}

export function isChristmasInParis(at: Date): boolean {
    const parts = new Intl.DateTimeFormat("fr-FR", {
        timeZone: "Europe/Paris",
        day: "numeric",
        month: "numeric",
    }).formatToParts(at);

    const get = (type: string) => parts.find((p) => p.type === type)?.value;

    return get("day") === "25" && get("month") === "12";
}