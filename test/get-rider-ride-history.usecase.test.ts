import { describe, it, expect, beforeEach } from "vitest";
import { FakeBookingRepository } from "./fakes/fake-booking.repository.js";
import { BookingBuilder } from "./builders/booking.builder.js";
import { RideBuilder } from "./builders/ride.builder.js";
import { FakeDriverRepository } from "./fakes/fake-driver-repository.js";
import { ListRideHistoryUseCase } from "../src/application/use-cases/list-ride-history.usecase.js";

describe("ListRideHistoryUseCase", () => {
      let listRideHistory: ListRideHistoryUseCase;
      let bookingRepository: FakeBookingRepository;
      let driverRepository: FakeDriverRepository;

      beforeEach(async () => {
          bookingRepository = new FakeBookingRepository();
          driverRepository = new FakeDriverRepository();
          listRideHistory = new ListRideHistoryUseCase(bookingRepository, driverRepository);

          await driverRepository.save({ id: "driver-1", name: "Alice", available: false });
      });

      it("should list the rider's rides with their driver", async () => {
          await bookingRepository.save(
              new BookingBuilder()
                  .withId("booking-1")
                  .withRiderId("rider-1")
                  .withRide(new RideBuilder().withId("ride-1").from("Paris").to("Lyon").withDistance(460).build())
                  .withStatus("assigned")
                  .withDriverId("driver-1")
                  .build(),
          );

          const history = await listRideHistory.execute({ riderId: "rider-1" });

          expect(history).toEqual({
              totalRides: 1,
              rides: [
                  {
                      bookingId: "booking-1",
                      departure: "Paris",
                      destination: "Lyon",
                      distanceKm: 460,
                      status: "assigned",
                      driver: { id: "driver-1", name: "Alice" },
                  },
              ],
            });
        });
    });
