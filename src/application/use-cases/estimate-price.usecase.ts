import { PriceQuote } from "../../domain/models/price-quote.js";
import type { Ride } from "../../domain/models/ride.js";
import type { DateProvider } from "../../domain/ports/date.provider.js";
import type { IDGenerator } from "../../domain/ports/id-generator.provider.js";
import type { PriceQuoteRepository } from "../../domain/ports/price-quote.repository.js";
import type { RiderRepository } from "../../domain/ports/rider.repository.js";
import type { RouteScanner } from "../../domain/ports/route.scanner.js";
import type { CalculatePriceUsecase } from "./calculate-price.usecase.js";

export type EstimatePriceParams = {
    riderId: string;
    from: string;
    to: string;
    uberX?: boolean;
};

export type Estimate = {
    token: string;
    price: number;
    expiresAt: Date;
};

export class EstimatePriceUseCase {
    constructor(
        private readonly calculatePriceUsecase: CalculatePriceUsecase,
        private readonly idGenerator: IDGenerator,
        private readonly riderRepository: RiderRepository,
        private readonly routeScanner: RouteScanner,
        private readonly dateProvider: DateProvider,
        private readonly quoteRepository: PriceQuoteRepository,
    ) {}

    async execute(params: EstimatePriceParams): Promise<Estimate | null> {
        const rider = await this.riderRepository.findById(params.riderId);

        if (!rider) {
            return null;
        }

        const route = await this.routeScanner.scan(params.from, params.to);
        const ride: Ride = {
            id: this.idGenerator.generate(),
            departure: route.departureCity,
            destination: route.destinationCity,
            distanceKm: route.distanceKm,
        };

        const uberX = params.uberX ?? false;
        const price = this.calculatePriceUsecase.execute(ride, { uberX, rider });

        const quote = PriceQuote.create({
            token: this.idGenerator.generate(),
            riderId: rider.id,
            ride,
            uberX,
            price,
            now: this.dateProvider.now(),
        });

        await this.quoteRepository.save(quote);

        return { token: quote.token, price: quote.price, expiresAt: quote.expiresAt };
    }
}