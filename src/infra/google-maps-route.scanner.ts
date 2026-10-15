import { AddressNotFoundError } from "../domain/errors/address-not-found-error.js";
import type { RouteScanner, ScannedRoute } from "../domain/ports/route.scanner.js";

export interface GoogleMapsClient {
    geocode(request: { params: { address: string; key: string } }): Promise<{
        data: {
            results: Array<{ address_components: Array<{ long_name: string; types: string[] }> }>;
        };
    }>;
    distancematrix(request: {
        params: { origins: string[]; destinations: string[]; key: string };
    }): Promise<{
        data: {
            rows: Array<{ elements: Array<{ distance?: { value: number } }> }>;
        };
    }>;
}

export class GoogleMapsRouteScanner implements RouteScanner {
    constructor(
        private readonly client: GoogleMapsClient,
        private readonly apiKey: string,
    ) {}

    async scan(from: string, to: string): Promise<ScannedRoute> {
        const [departureCity, destinationCity, distanceKm] = await Promise.all([
            this.cityOf(from),
            this.cityOf(to),
            this.distanceKmBetween(from, to),
        ]);

        return { departureCity, destinationCity, distanceKm };
    }

    private async cityOf(address: string): Promise<string> {
        const { data } = await this.client.geocode({
            params: { address, key: this.apiKey },
        });

        const city = data.results[0]?.address_components
            .find((component) => component.types.includes("locality"))
            ?.long_name;

        if (!city) {
            throw new AddressNotFoundError(address);
        }

        return city;
    }

    private async distanceKmBetween(from: string, to: string): Promise<number> {
        const { data } = await this.client.distancematrix({
            params: { origins: [from], destinations: [to], key: this.apiKey },
        });

        const meters = data.rows[0]?.elements[0]?.distance?.value;

        if (meters === undefined) {
            throw new AddressNotFoundError(`${from} -> ${to}`);
        }

        return meters / 1000;
    }
}
