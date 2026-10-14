import type { IDGenerator } from "../src/id-generator.provider.js";

export class StubIDGenerator implements IDGenerator {
        id: string = "";
        generate(): string {
            return this.id;
        }
    }