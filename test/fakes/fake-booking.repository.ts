import type { Booking } from "../../src/booking.js";
import type { BookingRepository } from "../../src/booking.repository.js";

export class FakeBookingRepository implements BookingRepository {
  public bookings: Booking[] = [];

  async save(booking: Booking): Promise<void> {
    this.bookings.push(booking);
  }

  async findByRiderId(riderId: string): Promise<Booking[]> {
    return this.bookings.filter((b) => b.rider.id === riderId);
  }
//   remove(id: string): Promise<void> {
//     this.baskets = this.baskets.filter((basket) => basket.id !== id);
//     return Promise.resolve();
//   }
}