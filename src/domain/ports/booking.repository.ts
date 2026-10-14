import type { Booking } from "../models/booking.js";

export interface BookingRepository{
    save(booking: Booking): Promise<void>;
    findByRiderId(id: string): Promise<Booking[]>;
    findById(id: string): Promise<Booking | null>;
}