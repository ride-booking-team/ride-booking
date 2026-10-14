import type { Booking } from "./booking.js";

export class Rider {
    constructor(
        readonly id: string,
        public balance: number,
        readonly birthDate: Date,
    ) {}

    canBook(price: number, bookings: Booking[]): boolean {
        if (this.balance < price) {
            return false;
        }

        return !bookings.some(
            (booking) =>
                booking.status === "pending" && !booking.driverId,
        );
    }
}