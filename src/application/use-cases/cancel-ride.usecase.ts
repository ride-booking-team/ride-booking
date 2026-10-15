import type { BookingRepository } from "../../domain/ports/booking.repository.js";
import type {DateProvider} from "../../domain/ports/date.provider.js";
import type {RiderRepository} from "../../domain/ports/rider.repository.js";
import { BookingStatus } from "../../domain/value-objects/booking-status.js";

export class CancelRideUseCase {
    constructor(
        private readonly bookingRepository: BookingRepository,
        private readonly dateProvider: DateProvider,
        private readonly riderRepository: RiderRepository,
    ) {}

    async execute(
        params: { bookingId: string },
    ): Promise<{ penalty: number } | null> {
        const booking = await this.bookingRepository.findById(params.bookingId);

        if (!booking) {
            return null;
        }
        if (booking.status.equals(BookingStatus.CANCELLED)) {
            return null;
        }
        const rider = await this.riderRepository.findById(booking.riderId);

        if (!rider) {
            return null;
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