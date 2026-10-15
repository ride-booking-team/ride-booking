import type { BookingRepository } from "../../domain/ports/booking.repository.js";
import type { DriverRepository } from "../../domain/ports/driver.repository.js";

export class ListRideHistoryUseCase {
    constructor(
        private readonly bookingRepository: BookingRepository,
        private readonly driverRepository: DriverRepository,
    ) {}

    async execute({ riderId }: { riderId: string }) {
    const bookings = await this.bookingRepository.findByRiderId(riderId);

    const rides = await Promise.all(
        bookings.map(async (booking) => {
            const driver = booking.driverId
                ? await this.driverRepository.findById(booking.driverId)
                : null;

            return {
                bookingId: booking.id,
                departure: booking.ride.departure,
                destination: booking.ride.destination,
                distanceKm: booking.ride.distanceKm,
                status: booking.status.toString(),
                driver: driver ? { id: driver.id, name: driver.name } : null,
            };
        }),
    );
    return { totalRides: rides.length, rides };
}
}