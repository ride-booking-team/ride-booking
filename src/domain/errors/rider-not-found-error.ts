export class RiderNotFoundError extends Error {
    constructor(readonly riderId: string) {
        super(`rider not found: ${riderId}`);
        this.name = "RiderNotFoundError";
    }
}
