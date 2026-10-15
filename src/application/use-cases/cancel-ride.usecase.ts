import type { BookingRepository } from "../../domain/ports/booking.repository.js";
import type {DateProvider} from "../../domain/ports/date.provider.js";
import type {RiderRepository} from "../../domain/ports/rider.repository.js";
import { BookingStatus } from "../../domain/value-objects/booking-status.js";
import { BookingAlreadyCancelledError } from "../../domain/errors/booking-already-cancelled-error.js";
import { BookingNotFoundError } from "../../domain/errors/booking-not-found-error.js";
import { RiderNotFoundError } from "../../domain/errors/rider-not-found-error.js";

export class CancelRideUseCase {
    constructor(
        private readonly bookingRepository: BookingRepository,
        private readonly dateProvider: DateProvider,
        private readonly riderRepository: RiderRepository,
    ) {}

    async execute(
        params: { bookingId: string },
    ): Promise<{ penalty: number }> {
        const booking = await this.bookingRepository.findById(params.bookingId);

        if (!booking) {
            throw new BookingNotFoundError(params.bookingId);
        }
        if (booking.status.equals(BookingStatus.CANCELLED)) {
            throw new BookingAlreadyCancelledError(booking.id);
        }
        const rider = await this.riderRepository.findById(booking.riderId);

        if (!rider) {
            throw new RiderNotFoundError(booking.riderId);
        }

        const penalty = booking.cancel({
            riderBirthday: rider.isBirthday(this.dateProvider.now()),
        });
        rider.pay(penalty);

        await this.riderRepository.save(rider);
        await this.bookingRepository.save(booking);

        return { penalty };
    }
}