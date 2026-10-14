import type { BookingRepository } from "../../src/booking.repository.js";
import type { Booking } from "../../src/booking.js";

export class FakeBookingRepository implements BookingRepository {
    private bookings: Booking[] = [];

    async save(booking: Booking): Promise<void> {
        this.bookings.push(booking);
    }

    async findByRiderId(riderId: string): Promise<Booking[]> {
        return this.bookings.filter(
            (booking) => booking.rider.id === riderId,
        );
    }
}