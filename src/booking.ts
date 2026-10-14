import type { Ride } from "./ride.js";
import type { Rider } from "./rider.js";

export type Booking = {
    id: string,
    ride: Ride,
    rider: Rider,
    hasPendingBooking?: boolean,
}