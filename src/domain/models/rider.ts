import type { Booking } from "./booking.js";

export class Rider {
    constructor(
        readonly id: string,
        private balanceValue: number,
        readonly birthDate: Date,
    ) {}

    get balance(): number {
        return this.balanceValue;
    }

    canBook(price: number, bookings: Booking[]): boolean {
        if (this.balanceValue < price) {
            return false;
        }

        return !bookings.some((booking) => booking.isWaitingForDriver());
    }

    isBirthday(today: Date): boolean {
        return (
            today.getUTCDate() === this.birthDate.getUTCDate() &&
            today.getUTCMonth() === this.birthDate.getUTCMonth()
        );
    }

    pay(amount: number): void {
        this.balanceValue -= amount;
    }
}