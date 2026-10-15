import { PriceQuote } from "../../src/domain/models/price-quote.js";
import type { PriceQuoteRepository } from "../../src/domain/ports/price-quote.repository.js";

export class FakePriceQuoteRepository implements PriceQuoteRepository {
    private readonly quotes = new Map<string, PriceQuote>();

    async save(quote: PriceQuote): Promise<void> {
        this.quotes.set(quote.token, copy(quote));
    }

    async findByToken(token: string): Promise<PriceQuote | null> {
        const quote = this.quotes.get(token);

        return quote ? copy(quote) : null;
    }
}

// Comme une vraie base, le fake ne partage jamais ses objets.
function copy(quote: PriceQuote): PriceQuote {
    return new PriceQuote({
        token: quote.token,
        riderId: quote.riderId,
        ride: quote.ride,
        uberX: quote.uberX,
        price: quote.price,
        expiresAt: quote.expiresAt,
    });
}