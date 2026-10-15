import type { Booking } from "./booking.js";
import { InsufficientFundsError } from "../errors/insufficient-funds-error.js";
import { PendingBookingError } from "../errors/pending-booking-error.js";

const MAX_BLOCKED_DRIVERS = 3;

export class Rider {
    private readonly blockedDriverIdsValue: string[];

    constructor(
        readonly id: string,
        private balanceValue: number,
        readonly birthDate: Date,
        blockedDriverIds: ReadonlyArray<string> = [],
    ) {
        this.blockedDriverIdsValue = [...blockedDriverIds];
    }

    get balance(): number {
        return this.balanceValue;
    }

    get blockedDriverIds(): ReadonlyArray<string> {
        return [...this.blockedDriverIdsValue];
    }

    ensureCanBook(price: number, bookings: Booking[]): void {
        if (this.balanceValue < price) {
            throw new InsufficientFundsError(this.id, price);
        }

        if (bookings.some((booking) => booking.isWaitingForDriver())) {
            throw new PendingBookingError(this.id);
        }
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

    blockDriver(driverId: string): void {
        if (this.hasBlocked(driverId)) {
            return;
        }

        if (this.blockedDriverIdsValue.length >= MAX_BLOCKED_DRIVERS) {
            throw new Error("cannot block more than 3 drivers");
        }

        this.blockedDriverIdsValue.push(driverId);
    }

    unblockDriver(driverId: string): void {
        const index = this.blockedDriverIdsValue.indexOf(driverId);

        if (index !== -1) {
            this.blockedDriverIdsValue.splice(index, 1);
        }
    }

    hasBlocked(driverId: string): boolean {
        return this.blockedDriverIdsValue.includes(driverId);
    }
}