import type { RiderRepository } from "../../domain/ports/rider.repository.js";

export class UnblockDriverUseCase {
    constructor(private readonly riderRepository: RiderRepository) {}

    async execute(params: { riderId: string; driverId: string }): Promise<void> {
        const rider = await this.riderRepository.findById(params.riderId);

        if (!rider) {
            return;
        }

        rider.unblockDriver(params.driverId);

        await this.riderRepository.save(rider);
    }
}