import type { PriceQuote } from "../models/price-quote.js";

export interface PriceQuoteRepository {
    save(quote: PriceQuote): Promise<void>;
    findByToken(token: string): Promise<PriceQuote | null>;
}