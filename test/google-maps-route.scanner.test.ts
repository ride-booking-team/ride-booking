import { describe, it, expect, beforeEach } from "vitest";
import { GoogleMapsRouteScanner } from "../src/infra/google-maps-route.scanner.js";
import { StubGoogleMapsClient } from "./stub-google-maps.client.js";
import { AddressNotFoundError } from "../src/domain/errors/address-not-found-error.js";
import { RouteNotFoundError } from "../src/domain/errors/route-not-found-error.js";

describe("GoogleMapsRouteScanner", () => {
    let client: StubGoogleMapsClient;
    let scanner: GoogleMapsRouteScanner;

    beforeEach(() => {
        client = new StubGoogleMapsClient();
        scanner = new GoogleMapsRouteScanner(client, "test-key");
    });

    it("should give back the cities and the distance in km", async () => {
        client
            .withAddress("10 rue de Rivoli", "Paris")
            .withAddress("Place Bellecour", "Lyon")
            .withDistance("10 rue de Rivoli", "Place Bellecour", 465_300);

        const route = await scanner.scan("10 rue de Rivoli", "Place Bellecour");

        expect(route).toEqual({
            departureCity: "Paris",
            destinationCity: "Lyon",
            distanceKm: 465.3,
        });
    });

    it("should reject an address Google does not know, and name it", async () => {
        client
            .withAddress("Place Bellecour", "Lyon")
            .withDistance("nowhere", "Place Bellecour", 1_000);

        const scanning = scanner.scan("nowhere", "Place Bellecour");

        await expect(scanning).rejects.toThrow(AddressNotFoundError);
        await expect(scanning).rejects.toMatchObject({ address: "nowhere" });
    });

    it("should reject an address that is not in a city", async () => {
        client
            .withAddressWithoutCity("France")
            .withAddress("Place Bellecour", "Lyon")
            .withDistance("France", "Place Bellecour", 400_000);

        await expect(scanner.scan("France", "Place Bellecour")).rejects.toThrow(
            AddressNotFoundError,
        );
    });

    it("should reject two addresses with no road between them", async () => {
        client
            .withAddress("10 rue de Rivoli", "Paris")
            .withAddress("Times Square", "New York");

        const scanning = scanner.scan("10 rue de Rivoli", "Times Square");

        await expect(scanning).rejects.toThrow(RouteNotFoundError);
        await expect(scanning).rejects.toMatchObject({
            from: "10 rue de Rivoli",
            to: "Times Square",
        });
    });
});
