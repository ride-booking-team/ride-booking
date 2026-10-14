import type { Rider } from "../../src/rider.js";

export class RiderBuilder {
    private rider: Rider = {
        id: "rider-1",
        balance: 10,
        birthDate: new Date("2000-01-01"),
    };

    withId(id: string): this {
        this.rider.id = id;
        return this;
    }

    withBalance(balance: number): this {
        this.rider.balance = balance;
        return this;
    }
    withBirthDate(birthDate: Date) {
        this.rider.birthDate = birthDate;
        return this;
    }

    build(): Rider {
        return { ...this.rider };
    }
}