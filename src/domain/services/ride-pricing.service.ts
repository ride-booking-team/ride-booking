import type { Ride } from "../models/ride.js";

export function calculateRidePrice(ride: Ride, at: Date): number {
    const { departure, destination, distanceKm } = ride;

    let basePrice = 1;

    if (departure === "Paris" && destination === "Paris") {
        basePrice = 2;
    } else if (departure !== "Paris" && destination === "Paris") {
        basePrice = 0;
    } else if (departure === "Paris" && destination !== "Paris") {
        basePrice = 10;
    }

    let price = basePrice + distanceKm * 0.5;

    return isChristmasInParis(at) ? price * 2 : price;
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