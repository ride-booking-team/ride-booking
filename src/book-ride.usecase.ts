import type { Booking } from "./booking.js";
import type { BookingRepository } from "./booking.repository.js";
import type { CalculatePriceUsecase } from "./calculate-price.usecase.js";
import type { IDGenerator } from "./id-generator.provider.js";
import type { Ride } from "./ride.js";
import type { Rider } from "./rider.js";

export type BookRideParams = {
  rider: Rider;
  ride: Ride;
};
export class BookRideUseCase {
    constructor(
        private readonly calculatePriceUsecase: CalculatePriceUsecase,
        private readonly idGenerator: IDGenerator,
        private readonly bookingRepository: BookingRepository,
    ){}

    async execute(params: BookRideParams): Promise<{ id: string } | null> {
        const ridePrice = this.calculatePriceUsecase.execute(params.ride)

        if(params.rider.balance < ridePrice) return null; 

        const existingBookings = await this.bookingRepository.findByRiderId(params.rider.id);

        if(existingBookings.some((booking) => booking.hasPendingBooking)) return null;

        const booking: Booking = {
            id: this.idGenerator.generate(),
            rider: params.rider,
            ride: params.ride,
            hasPendingBooking: true,
        };

        await this.bookingRepository.save(booking);

        return { id: booking.id };
    }
}