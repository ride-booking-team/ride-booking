import { describe, it, expect, beforeEach } from "vitest";
import { BlockDriverUseCase } from "../src/application/use-cases/block-driver.usecase.js";
import { FakeRiderRepository } from "./fakes/fake-rider.repository.js";
import { RiderBuilder } from "./builders/rider.builder.js";

describe("BlockDriverUseCase", () => {
    let blockDriver: BlockDriverUseCase;
    let riderRepository: FakeRiderRepository;

    beforeEach(() => {
        riderRepository = new FakeRiderRepository();
        blockDriver = new BlockDriverUseCase(riderRepository);
    });

    it("should save the blocked driver in the rider", async () => {
        await riderRepository.save(new RiderBuilder().withId("rider-1").build());

        await blockDriver.execute({ riderId: "rider-1", driverId: "driver-1" });

        const rider = await riderRepository.findById("rider-1");
        expect(rider?.hasBlocked("driver-1")).toBe(true);
    });
});