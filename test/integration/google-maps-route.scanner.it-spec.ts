// import { describe, it, expect } from "vitest";
// import { createRouteScanner } from "../../src/infra/create-route-scanner.js";
// import { AddressNotFoundError } from "../../src/domain/errors/address-not-found-error.js";

// describe.skipIf(!process.env.GOOGLE_MAPS_API_KEY)("GoogleMapsRouteScanner (real API)", () => {
//     const scanner = createRouteScanner();

//     it("should find Paris as the city of a Parisian address", async () => {
//         const route = await scanner.scan("10 rue de Rivoli, Paris", "Place Bellecour, Lyon");

//         expect(route.departureCity).toBe("Paris");
//         expect(route.destinationCity).toBe("Lyon");
//     }, 10_000);

//     it("should not find Paris for an address just outside", async () => {
//         const route = await scanner.scan("Mairie de Boulogne-Billancourt", "Tour Eiffel, Paris");

//         expect(route.departureCity).not.toBe("Paris");
//     }, 10_000);

//     it("should give a road distance in km", async () => {
//         const route = await scanner.scan("Tour Eiffel, Paris", "Château de Versailles");

//         expect(route.distanceKm).toBeGreaterThan(15);
//         expect(route.distanceKm).toBeLessThan(35);
//     }, 10_000);

//     it("should reject an address that does not exist", async () => {
//         await expect(
//             scanner.scan("xqzjwvk qqqzz 00000", "Tour Eiffel, Paris"),
//         ).rejects.toThrow(AddressNotFoundError);
//     }, 10_000);
// });
