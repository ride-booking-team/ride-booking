import type { Ride } from "./ride.js";

const VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

type PriceQuoteProps = {
    token: string;
    riderId: string;
    ride: Ride;
    uberX: boolean;
    price: number;
    expiresAt: Date;
    used?: boolean;
};

export class PriceQuote {
    readonly token: string;
    readonly riderId: string;
    readonly ride: Ride;
    readonly uberX: boolean;
    readonly price: number;
    readonly expiresAt: Date;

    private usedValue: boolean;

    constructor({ token, riderId, ride, uberX, price, expiresAt, used = false }: PriceQuoteProps) {
        this.token = token;
        this.riderId = riderId;
        this.ride = { ...ride };
        this.uberX = uberX;
        this.price = price;
        this.expiresAt = new Date(expiresAt);
        this.usedValue = used;
    }

    get isUsed(): boolean {
        return this.usedValue;
    }

    markAsUsed(): void {
        this.usedValue = true;
    }

    static create(props: Omit<PriceQuoteProps, "expiresAt"> & { now: Date }): PriceQuote {
        const { now, ...rest } = props;

        return new PriceQuote({
            ...rest,
            expiresAt: new Date(now.getTime() + VALIDITY_MS),
        });
    }

    isExpired(now: Date): boolean {
        return now.getTime() >= this.expiresAt.getTime();
    }
}