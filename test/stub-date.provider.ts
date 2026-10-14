import type { DateProvider } from "../src/domain/ports/date.provider.js";

export class StubDateProvider implements DateProvider {
    date = new Date("2026-10-14");

    now(): Date {
        return this.date;
    }
}