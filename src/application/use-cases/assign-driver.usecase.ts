import type { BookingRepository } from "../../domain/ports/booking.repository.js";
import type { RiderRepository } from "../../domain/ports/rider.repository.js";

export class AssignDriverUseCase {
    constructor(
        private readonly bookingRepository: BookingRepository,
        private readonly riderRepository: RiderRepository,
    ) {}

    async execute(params: { bookingId: string; driverId: string }): Promise<void> {
        const booking = await this.bookingRepository.findById(params.bookingId);

        if (!booking) {
            return;
        }

        const rider = await this.riderRepository.findById(booking.riderId);

        if (rider?.hasBlocked(params.driverId)) {
            return;
        }

        booking.assignDriver(params.driverId);

        await this.bookingRepository.save(booking);
    }
}