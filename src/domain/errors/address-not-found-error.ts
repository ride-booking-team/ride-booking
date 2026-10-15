export class AddressNotFoundError extends Error {
    constructor(readonly address: string) {
        super(`address not found: ${address}`);
        this.name = "AddressNotFoundError";
    }
}