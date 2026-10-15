export class QuoteExpiredError extends Error {
    constructor(readonly token: string) {
        super(`price quote expired: ${token}`);
        this.name = "QuoteExpiredError";
    }
}