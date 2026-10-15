import type { Ride } from "./ride.js";
import { BookingStatus } from "../value-objects/booking-status.js";

const PENALTY_WHEN_DRIVER_ON_THE_WAY = 5;

type BookingProps = {
    id: string;
    ride: Ride;
    riderId: string;
    status: BookingStatus;
    price: number;
    driverId?: string | undefined;
};

export class Booking {
    readonly id: string;
    readonly riderId: string;
    readonly price: number;

    private readonly rideValue: Ride;
    private statusValue: BookingStatus;
    private driverIdValue: string | undefined;

    constructor({ id, ride, riderId, status, price, driverId }: BookingProps) {
        this.id = id;
        this.riderId = riderId;
        this.price = price;
        this.driverIdValue = driverId;
        this.rideValue = { ...ride };
        this.statusValue = status;
    }

    get ride(): Ride {
        return { ...this.rideValue };
    }

    get status(): BookingStatus {
        return this.statusValue;
    }

    get driverId(): string | undefined {
        return this.driverIdValue;
    }

    isWaitingForDriver(): boolean {
        return this.statusValue.equals(BookingStatus.PENDING) && !this.driverIdValue;
    }

    assignDriver(driverId: string): void {
        if (this.statusValue.equals(BookingStatus.CANCELLED)) {
            throw new Error("cannot assign a driver to a cancelled booking");
        }

        this.driverIdValue = driverId;
        this.statusValue = BookingStatus.ASSIGNED;
    }

    /**
     * Annule la réservation et renvoie la pénalité à payer.
     */
    cancel({ riderBirthday }: { riderBirthday: boolean }): number {
        if (this.statusValue.equals(BookingStatus.CANCELLED)) {
            throw new Error("booking already cancelled");
        }

        const penalty =
            this.statusValue.equals(BookingStatus.ON_THE_WAY) && !riderBirthday
                ? PENALTY_WHEN_DRIVER_ON_THE_WAY
                : 0;

        this.statusValue = BookingStatus.CANCELLED;

        return penalty;
    }
}