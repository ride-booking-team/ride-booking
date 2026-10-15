import type { Ride } from "./ride.js";
import type { BookingStatus } from "../value-objects/booking-status.js";

export type Booking = {
    id: string;
    ride: Ride;
    riderId: string;
    status: BookingStatus;
    driverId?: string;
};
