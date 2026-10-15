export class BookingAlreadyCancelledError extends Error {
    constructor(readonly bookingId: string) {
        super(`booking already cancelled: ${bookingId}`);
        this.name = "BookingAlreadyCancelledError";
    }
}
