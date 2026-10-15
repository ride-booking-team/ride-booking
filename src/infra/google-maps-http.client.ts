import { Client } from "@googlemaps/google-maps-services-js";
import type { GoogleMapsClient } from "./google-maps-route.scanner.js";

const ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";

export class GoogleMapsHttpClient implements GoogleMapsClient {
    private readonly geocoding = new Client({});

    geocode(request: { params: { address: string; key: string } }) {
        return this.geocoding.geocode(request);
    }

    async distancematrix({ params }: {
        params: { origins: string[]; destinations: string[]; key: string };
    }) {
        const response = await fetch(ROUTES_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": params.key,
                "X-Goog-FieldMask": "routes.distanceMeters",
            },
            body: JSON.stringify({
                origin: { address: params.origins[0] },
                destination: { address: params.destinations[0] },
                travelMode: "DRIVE",
            }),
        });

        if (!response.ok) {
            throw new Error(`Routes API error ${response.status}: ${await response.text()}`);
        }

        const { routes } = (await response.json()) as {
            routes?: Array<{ distanceMeters?: number }>;
        };
        const meters = routes?.[0]?.distanceMeters;

        return {
            data: {
                rows: [{
                    elements: [meters === undefined ? {} : { distance: { value: meters } }],
                }],
            },
        };
    }
}
