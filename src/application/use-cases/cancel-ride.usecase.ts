import type { BookingRepository } from "../../domain/ports/booking.repository.js";
import type {DateProvider} from "../../domain/ports/date.provider.js";
import type {RiderRepository} from "../../domain/ports/rider.repository.js";

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
        if (booking.status === "cancelled") {
            return null;
        }
        const rider = await this.riderRepository.findById(booking.riderId);

        if (!rider) {
            return null;
        }


        const today = this.dateProvider.now();
        const birthDate = rider.birthDate;

        const isBirthday =
            today.getUTCDate() === birthDate.getUTCDate() &&
            today.getUTCMonth() === birthDate.getUTCMonth();
        const penalty = booking.status === "on_the_way" && !isBirthday ? 5 : 0;

        rider.balance -= penalty;
        booking.status = "cancelled";

        await this.riderRepository.save(rider);
        await this.bookingRepository.save(booking);

        return { penalty };
    }
}