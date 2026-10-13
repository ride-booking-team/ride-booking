import { describe, it, expect } from "vitest";

it("should return 1", () => {
    expect(calculatePrice()).toBe(1);
});

function calculatePrice() {
    return 1;
}