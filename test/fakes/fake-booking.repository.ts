import type { BookingRepository } from "../../src/booking.repository.js";
import type { Booking } from "../../src/booking.js";

export class FakeBookingRepository implements BookingRepository {
    private bookings: Booking[] = [];

    async save(booking: Booking): Promise<void> {
        const index = this.bookings.findIndex(
            (existingBooking) => existingBooking.id === booking.id
        );

        if (index === -1) {
            this.bookings.push(booking);
        } else {
            this.bookings[index] = booking;
        }
    }

    async findByRiderId(riderId: string): Promise<Booking[]> {
        return this.bookings.filter(
            (booking) => booking.rider.id === riderId,
        );
    }
    async findById(id: string): Promise<Booking | null> {
        return this.bookings.find((booking) => booking.id === id) ?? null;
    }
}