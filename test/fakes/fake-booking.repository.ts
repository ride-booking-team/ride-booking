import type { BookingRepository } from "../../src/domain/ports/booking.repository.js";
import type { Booking } from "../../src/domain/models/booking.js";

export class FakeBookingRepository implements BookingRepository {
    private bookings: Booking[] = [];

    async save(booking: Booking): Promise<void> {
        const index = this.bookings.findIndex(
            (existingBooking) => existingBooking.id === booking.id
        );

        if (index === -1) {
            this.bookings.push(copy(booking));
        } else {
            this.bookings[index] = copy(booking);
        }
    }

    async findByRiderId(riderId: string): Promise<Booking[]> {
        return this.bookings
            .filter((booking) => booking.riderId === riderId)
            .map(copy);
    }

    async findById(id: string): Promise<Booking | null> {
        const booking = this.bookings.find((booking) => booking.id === id);

        return booking ? copy(booking) : null;
    }
}

// Comme une vraie base, le fake ne partage jamais ses objets :
// il stocke et renvoie des copies.
function copy(booking: Booking): Booking {
    return { ...booking, ride: { ...booking.ride } };
}