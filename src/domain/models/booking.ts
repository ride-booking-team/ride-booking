import type { Ride } from "./ride.js";
import { BookingStatus } from "../value-objects/booking-status.js";

const PENALTY_WHEN_DRIVER_ON_THE_WAY = 5;

type BookingProps = {
    id: string;
    ride: Ride;
    riderId: string;
    status: BookingStatus;
    driverId?: string | undefined;
    createdAt: Date;
};

export class Booking {
    readonly id: string;
    readonly riderId: string;
    readonly driverId: string | undefined;

    private readonly rideValue: Ride;
    private statusValue: BookingStatus;

    constructor({ id, ride, riderId, status, driverId }: BookingProps) {
        this.id = id;
        this.riderId = riderId;
        this.driverId = driverId;
        this.rideValue = { ...ride };
        this.statusValue = status;
    }

    get ride(): Ride {
        return { ...this.rideValue };
    }

    get status(): BookingStatus {
        return this.statusValue;
    }

    isWaitingForDriver(): boolean {
        return this.statusValue.equals(BookingStatus.PENDING) && !this.driverId;
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