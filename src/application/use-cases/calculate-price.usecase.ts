import type { Ride } from "../../domain/models/ride.js";
import type { Rider } from "../../domain/models/rider.js";
import type { DateProvider } from "../../domain/ports/date.provider.js";
import {calculateRidePrice, isChristmasInParis} from "../../domain/services/ride-pricing.service.js";


export type PriceOptions = {
      uberX?: boolean;
      rider?: Rider;
  };

  export class CalculatePriceUsecase {
      constructor(private readonly dateProvider: DateProvider) {}

      execute(ride: Ride, { uberX = false, rider }: PriceOptions = {}): number {
          const now = this.dateProvider.now();

          return calculateRidePrice(ride, now, {
              uberX,
              riderBirthday: rider?.isBirthday(now) ?? false,
          });
      }
  }