import type { DateProvider } from "../domain/ports/date.provider.js";

export class SystemDateProvider implements DateProvider {
    now(): Date {
        return new Date();
    }
}
