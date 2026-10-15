export class BookingNotFoundError extends Error {
    constructor(readonly bookingId: string) {
        super(`booking not found: ${bookingId}`);
        this.name = "BookingNotFoundError";
    }
}
