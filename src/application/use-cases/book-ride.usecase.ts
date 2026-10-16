import { Booking } from "../../domain/models/booking.js";
import type { BookingRepository } from "../../domain/ports/booking.repository.js";
import type { CalculatePriceUsecase } from "./calculate-price.usecase.js";
import type { IDGenerator } from "../../domain/ports/id-generator.provider.js";
import type { Ride } from "../../domain/models/ride.js";
import type {RiderRepository} from "../../domain/ports/rider.repository.js";
import { BookingStatus } from "../../domain/value-objects/booking-status.js";
import type { RouteScanner } from "../../domain/ports/route.scanner.js";
import type { PriceQuoteRepository } from "../../domain/ports/price-quote.repository.js";
import type { DateProvider } from "../../domain/ports/date.provider.js";
import { QuoteExpiredError } from "../../domain/errors/quote-expired-error.js";
import { UnknownQuoteError } from "../../domain/errors/unknown-quote-error.js";
import { QuoteAlreadyUsedError } from "../../domain/errors/quote-already-used-error.js";
import type { PriceQuote } from "../../domain/models/price-quote.js";
import { RiderNotFoundError } from "../../domain/errors/rider-not-found-error.js";

export type BookRideParams =
    | { riderId: string; from: string; to: string; uberX?: boolean }
    | { riderId: string; token: string };

export class BookRideUseCase {
    constructor(
        private readonly calculatePriceUsecase: CalculatePriceUsecase,
        private readonly idGenerator: IDGenerator,
        private readonly bookingRepository: BookingRepository,
        private readonly riderRepository: RiderRepository,
        private readonly routeScanner: RouteScanner,
        private readonly quoteRepository: PriceQuoteRepository,
        private readonly dateProvider: DateProvider,
    ) {}

    async execute(params: BookRideParams): Promise<{ id: string }> {
        const rider = await this.riderRepository.findById(params.riderId);

        if (!rider) {
            throw new RiderNotFoundError(params.riderId);
        }

        let ride: Ride;
        let price: number;
        let quote: PriceQuote | null = null;

        if ("token" in params) {
            // Avec un token : on reprend le devis, sans rescanner ni recalculer.
            quote = await this.quoteRepository.findByToken(params.token);

            if (!quote || quote.riderId !== params.riderId) {
                throw new UnknownQuoteError(params.token);
            }

            if (quote.isUsed) {
                throw new QuoteAlreadyUsedError(params.token);
            }

            if (quote.isExpired(this.dateProvider.now())) {
                throw new QuoteExpiredError(params.token);
            }

            ride = quote.ride;
            price = quote.price;
        } else {
            const route = await this.routeScanner.scan(params.from, params.to);
            ride = {
                id: this.idGenerator.generate(),
                departure: route.departureCity,
                destination: route.destinationCity,
                distanceKm: route.distanceKm,
            };
            price = this.calculatePriceUsecase.execute(ride, {
                uberX: params.uberX ?? false,
                rider,
            });
        }

        const existingBookings =
            await this.bookingRepository.findByRiderId(rider.id);

        rider.ensureCanBook(price, existingBookings);

        const booking = new Booking({
            id: this.idGenerator.generate(),
            riderId: rider.id,
            ride,
            status: BookingStatus.PENDING,
            price,
        });

        rider.earnLoyaltyPoints();
        // Le point et la réservation sont enregistrés ensemble, ou pas du tout.
        await this.bookingRepository.saveWithRider(booking, rider);

        if (quote) {
            quote.markAsUsed();
            await this.quoteRepository.save(quote);
        }

        return { id: booking.id };
    }
}