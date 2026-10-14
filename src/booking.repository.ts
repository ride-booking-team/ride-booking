import type { Booking } from "./booking.js";

export interface BookingRepository{
    save(booking: Booking): Promise<void>;
    findByRiderId(id: string): Promise<Booking[]>;
}