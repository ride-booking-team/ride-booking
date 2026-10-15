import type { Driver } from "../../src/domain/models/driver.js";
import type { DriverRepository } from "../../src/domain/ports/driver.repository.js";

export class FakeDriverRepository implements DriverRepository {
    private drivers: Driver[] = [];

    async save(driver: Driver): Promise<void> {
        const index = this.drivers.findIndex((d) => d.id === driver.id);
        if (index === -1) this.drivers.push({ ...driver });
        else this.drivers[index] = { ...driver };
    }

    async findById(id: string): Promise<Driver | null> {
        const driver = this.drivers.find((d) => d.id === id);
        return driver ? { ...driver } : null;
    }
}