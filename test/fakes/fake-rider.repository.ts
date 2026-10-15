
import { Rider } from "../../src/domain/models/rider.js";
import type { RiderRepository } from "../../src/domain/ports/rider.repository.js";

export class FakeRiderRepository implements RiderRepository {
    private riders: Rider[] = [];
    private savesFail = false;

    // Simule une base qui refuse d'enregistrer le rider (panne, contrainte...).
    failOnSave(): void {
        this.savesFail = true;
    }

    async findById(id: string): Promise<Rider | null> {
        const rider = this.riders.find((rider) => rider.id === id);

        if (!rider) {
            return null;
        }

        return new Rider(
            rider.id,
            rider.balance,
            rider.birthDate,
            rider.blockedDriverIds,
            rider.loyaltyPoints,
        );
    }

    async save(rider: Rider): Promise<void> {
        if (this.savesFail) {
            throw new Error(`cannot save rider ${rider.id}`);
        }

        const index = this.riders.findIndex((r) => r.id === rider.id);

        const copy = new Rider(
            rider.id,
            rider.balance,
            rider.birthDate,
            rider.blockedDriverIds,
            rider.loyaltyPoints,
        );

        if (index === -1) {
            this.riders.push(copy);
            return;
        }

        this.riders[index] = copy;
    }
}
