import type { DateProvider } from "../src/date.provider.js";

export class StubDateProvider implements DateProvider {
    date = new Date("2026-10-14");

    now(): Date {
        return this.date;
    }
}