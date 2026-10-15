export class InsufficientFundsError extends Error {
    constructor(readonly riderId: string, readonly price: number) {
        super(`rider ${riderId} cannot pay ${price}`);
        this.name = "InsufficientFundsError";
    }
}
