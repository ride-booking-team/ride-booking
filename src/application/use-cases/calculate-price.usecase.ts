import type { Ride } from "../../domain/models/ride.js";
import type { DateProvider } from "../../domain/ports/date.provider.js";
import {calculateRidePrice, isChristmasInParis} from "../../domain/services/ride-pricing.service.js";


export class CalculatePriceUsecase {

    constructor(
        private readonly dateProvider: DateProvider,
    ){}

    execute(ride: Ride): number {
        return calculateRidePrice(ride,this.dateProvider.now());
    }
}