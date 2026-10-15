import { Booking } from "../../domain/models/booking.js";
import type { BookingRepository } from "../../domain/ports/booking.repository.js";
import type { CalculatePriceUsecase } from "./calculate-price.usecase.js";
import type { IDGenerator } from "../../domain/ports/id-generator.provider.js";
import type { Ride } from "../../domain/models/ride.js";
import type { Rider } from "../../domain/models/rider.js";
import type {RiderRepository} from "../../domain/ports/rider.repository.js";
import { BookingStatus } from "../../domain/value-objects/booking-status.js";

export type BookRideParams = {
    riderId: string;
    ride: Ride;
};

export class BookRideUseCase {
    constructor(
        private readonly calculatePriceUsecase: CalculatePriceUsecase,
        private readonly idGenerator: IDGenerator,
        private readonly bookingRepository: BookingRepository,
        private readonly riderRepository: RiderRepository,
    ) {}

    async execute(params: BookRideParams): Promise<{ id: string } | null> {
        const rider = await this.riderRepository.findById(params.riderId);

        if (!rider) {
            return null;
        }
        const price = this.calculatePriceUsecase.execute(params.ride);

        const existingBookings =
            await this.bookingRepository.findByRiderId(rider.id);

        if (!rider.canBook(price, existingBookings)) {
            return null;
        }
        const booking = new Booking({
            id: this.idGenerator.generate(),
            riderId: rider.id,
            ride: params.ride,
            status: BookingStatus.PENDING,
        });

        await this.bookingRepository.save(booking);

        return { id: booking.id };
    }
}