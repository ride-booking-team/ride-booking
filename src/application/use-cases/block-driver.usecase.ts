import type { RiderRepository } from "../../domain/ports/rider.repository.js";

export class BlockDriverUseCase {
    constructor(private readonly riderRepository: RiderRepository) {}

    async execute(params: { riderId: string; driverId: string }): Promise<void> {
        const rider = await this.riderRepository.findById(params.riderId);

        if (!rider) {
            return;
        }

        rider.blockDriver(params.driverId);

        await this.riderRepository.save(rider);
    }
}