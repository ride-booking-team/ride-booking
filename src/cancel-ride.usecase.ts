import type { BookingRepository } from "./booking.repository.js";
import type {DateProvider} from "./date.provider.js";

export class CancelRideUseCase {
    constructor(
        private readonly bookingRepository: BookingRepository,
        private readonly dateProvider: DateProvider,
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

        const today = this.dateProvider.now();
        const birthDate = booking.rider.birthDate;

        const isBirthday =
            today.getUTCDate() === birthDate.getUTCDate() &&
            today.getUTCMonth() === birthDate.getUTCMonth();
        const penalty = booking.status === "on_the_way" && !isBirthday ? 5 : 0;

        booking.rider.balance -= penalty;
        booking.status = "cancelled";
        await this.bookingRepository.save(booking);

        return { penalty };
    }
}