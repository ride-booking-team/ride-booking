import type { Ride } from "../models/ride.js";

const UBERX_SUPPLEMENT = 5;

export type PricingOptions = {
    uberX: boolean;
    riderBirthday: boolean;
};

  const RUSH_HOUR_RATE = 1.5;
  const RUSH_HOURS = [8, 18, 19]; 

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
      const priceWithRushHour = isRushHourInParis(at)                       
          ? priceWithChristmas * RUSH_HOUR_RATE
          : priceWithChristmas;

      const supplement = uberX && !riderBirthday ? UBERX_SUPPLEMENT : 0;
      return priceWithRushHour + supplement;                                 
  }

  export function isRushHourInParis(at: Date): boolean {
      const hour = new Intl.DateTimeFormat("fr-FR", {
          timeZone: "Europe/Paris",
          hour: "numeric",
          hourCycle: "h23",
      })
          .formatToParts(at)
          .find((part) => part.type === "hour")?.value;

      return RUSH_HOURS.includes(Number(hour));
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