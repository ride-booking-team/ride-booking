import { describe, it, expect, beforeEach } from "vitest";
import { UnblockDriverUseCase } from "../src/application/use-cases/unblock-driver.usecase.js";
import { FakeRiderRepository } from "./fakes/fake-rider.repository.js";
import { RiderBuilder } from "./builders/rider.builder.js";

describe("UnblockDriverUseCase", () => {
    let unblockDriver: UnblockDriverUseCase;
    let riderRepository: FakeRiderRepository;

    beforeEach(() => {
        riderRepository = new FakeRiderRepository();
        unblockDriver = new UnblockDriverUseCase(riderRepository);
    });

    it("should save the rider without the unblocked driver", async () => {
        const rider = new RiderBuilder().withId("rider-1").build();
        rider.blockDriver("driver-1");
        await riderRepository.save(rider);

        await unblockDriver.execute({ riderId: "rider-1", driverId: "driver-1" });

        const savedRider = await riderRepository.findById("rider-1");
        expect(savedRider?.hasBlocked("driver-1")).toBe(false);
    });
});