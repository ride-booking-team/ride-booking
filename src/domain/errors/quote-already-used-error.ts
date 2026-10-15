export class QuoteAlreadyUsedError extends Error {
    constructor(readonly token: string) {
        super(`price quote already used: ${token}`);
        this.name = "QuoteAlreadyUsedError";
    }
}