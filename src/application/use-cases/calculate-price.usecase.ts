import type { Ride } from "../../domain/models/ride.js";
import {calculateRidePrice} from "../../domain/services/ride-pricing.service.js";


export class CalculatePriceUsecase {

    execute(ride: Ride): number {
        return calculateRidePrice(ride);
    }
}