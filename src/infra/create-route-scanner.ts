import type { RouteScanner } from "../domain/ports/route.scanner.js";
import { GoogleMapsHttpClient } from "./google-maps-http.client.js";
import { GoogleMapsRouteScanner } from "./google-maps-route.scanner.js";

export function createRouteScanner(
    apiKey = process.env.GOOGLE_MAPS_API_KEY,
): RouteScanner {
    if (!apiKey) {
        throw new Error("GOOGLE_MAPS_API_KEY is missing");
    }

    return new GoogleMapsRouteScanner(new GoogleMapsHttpClient(), apiKey);
}