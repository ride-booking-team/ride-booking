import { Rider } from "../../src/domain/models/rider.js";

export class RiderBuilder {
    private id = "rider-1";
    private balance = 10;
    private birthDate = new Date("2000-01-01");

    withId(id: string): this {
        this.id = id;
        return this;
    }

    withBalance(balance: number): this {
        this.balance = balance;
        return this;
    }
    withBirthDate(birthDate: Date) {
        this.birthDate = birthDate;
        return this;
    }

    build(): Rider {
        return new Rider(this.id, this.balance, this.birthDate);
    }
}
