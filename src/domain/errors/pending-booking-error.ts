export class PendingBookingError extends Error {
    constructor(readonly riderId: string) {
        super(`rider ${riderId} already has a booking waiting for a driver`);
        this.name = "PendingBookingError";
    }
}
