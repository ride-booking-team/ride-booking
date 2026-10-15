import type { Ride } from "../models/ride.js";

export interface RideRepository {
    save(ride: Ride): Promise<void>;
    findById(id: string): Promise<Ride | null>;
}