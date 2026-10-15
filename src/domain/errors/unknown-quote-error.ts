export class UnknownQuoteError extends Error {
    constructor(readonly token: string) {
        super(`unknown price quote: ${token}`);
        this.name = "UnknownQuoteError";
    }
}