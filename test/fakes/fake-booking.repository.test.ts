import { bookingRepositoryContract } from "../contracts/booking-repository.contract.js";
import { FakeBookingRepository } from "./fake-booking.repository.js";

bookingRepositoryContract(
    "FakeBookingRepository",
    async () => new FakeBookingRepository(),
);