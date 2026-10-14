
import { Rider } from "../../src/domain/models/rider.js";
import type { RiderRepository } from "../../src/domain/ports/rider.repository.js";

export class FakeRiderRepository implements RiderRepository {
    private riders: Rider[] = [];

    async findById(id: string): Promise<Rider | null> {
        const rider = this.riders.find((rider) => rider.id === id);

        if (!rider) {
            return null;
        }

        return new Rider(
            rider.id,
            rider.balance,
            rider.birthDate,
        );
    }

    async save(rider: Rider): Promise<void> {
        const index = this.riders.findIndex((r) => r.id === rider.id);

        const copy = new Rider(
            rider.id,
            rider.balance,
            rider.birthDate,
        );

        if (index === -1) {
            this.riders.push(copy);
            return;
        }

        this.riders[index] = copy;
    }
}
