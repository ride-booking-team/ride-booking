import type { BookingRepository } from "../../src/domain/ports/booking.repository.js";
import type { RiderRepository } from "../../src/domain/ports/rider.repository.js";
import { Booking } from "../../src/domain/models/booking.js";
import type { Rider } from "../../src/domain/models/rider.js";

export class FakeBookingRepository implements BookingRepository {
    private bookings: Booking[] = [];

    constructor(private readonly riders?: RiderRepository) {}

    // Tout ou rien, comme la transaction de la vraie base :
    // si le rider n'est pas enregistré, la réservation non plus.
    async saveWithRider(booking: Booking, rider: Rider): Promise<void> {
        if (!this.riders) {
            throw new Error("FakeBookingRepository needs a RiderRepository to save a rider");
        }

        await this.riders.save(rider);
        await this.save(booking);
    }

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
    return new Booking({
        id: booking.id,
        riderId: booking.riderId,
        ride: booking.ride,
        status: booking.status,
        price: booking.price,
        driverId: booking.driverId,
    });
}