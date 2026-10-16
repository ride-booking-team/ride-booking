import type { Booking } from "../models/booking.js";
import type { Rider } from "../models/rider.js";

export interface BookingRepository{
    save(booking: Booking): Promise<void>;
    // Enregistre la réservation et le rider ensemble : tout ou rien.
    saveWithRider(booking: Booking, rider: Rider): Promise<void>;
    findByRiderId(id: string): Promise<Booking[]>;
    findById(id: string): Promise<Booking | null>;
}