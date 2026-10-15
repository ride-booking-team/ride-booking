import { randomUUID } from "node:crypto";
import type { IDGenerator } from "../domain/ports/id-generator.provider.js";

export class CryptoIdGenerator implements IDGenerator {
    generate(): string {
        return randomUUID();
    }
}
