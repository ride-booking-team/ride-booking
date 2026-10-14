import type {Rider} from "../models/rider.js";


export interface RiderRepository {
    findById(id: string): Promise<Rider | null>;
    save(rider: Rider): Promise<void>;
}