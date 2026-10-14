import type { Ride } from "./ride.js";
import type { Rider } from "./rider.js";
export type BookingStatus = "pending" | "assigned" | "cancelled" | "on_the_way";

export type Booking = {
    id: string,
    ride: Ride,
    riderId: string;
    status: BookingStatus;
    driverId?: string;
}