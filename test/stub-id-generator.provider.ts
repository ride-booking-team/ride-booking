import type { IDGenerator } from "../src/domain/ports/id-generator.provider.js";

export class StubIDGenerator implements IDGenerator {
        id: string = "";
        generate(): string {
            return this.id;
        }
    }