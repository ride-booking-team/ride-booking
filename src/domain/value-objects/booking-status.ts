export const BOOKING_STATUSES = [
    "pending",
    "assigned",
    "cancelled",
    "on_the_way",
] as const;

type BookingStatusValue = (typeof BOOKING_STATUSES)[number];

export class BookingStatus {
    private constructor(private readonly value: BookingStatusValue) {}

    static readonly PENDING = new BookingStatus("pending");
    static readonly ASSIGNED = new BookingStatus("assigned");
    static readonly CANCELLED = new BookingStatus("cancelled");
    static readonly ON_THE_WAY = new BookingStatus("on_the_way");

    static of(value: string): BookingStatus {
        if (!BOOKING_STATUSES.includes(value as BookingStatusValue)) {
            throw new Error("invalid booking status");
        }

        return new BookingStatus(value as BookingStatusValue);
    }

    equals(other: BookingStatus): boolean {
        return this.value === other.value;
    }

    toString(): BookingStatusValue {
        return this.value;
    }
}
