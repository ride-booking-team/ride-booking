import type { Driver } from "../models/driver.js";

export interface DriverRepository {
    save(driver: Driver): Promise<void>;
    findById(id: string): Promise<Driver | null>;
}
