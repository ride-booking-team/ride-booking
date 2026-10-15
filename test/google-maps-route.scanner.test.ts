import { describe, it, expect, beforeEach } from "vitest";
import { GoogleMapsRouteScanner } from "../src/infra/google-maps-route.scanner.js";
import { StubGoogleMapsClient } from "./stub-google-maps.client.js";

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
});
