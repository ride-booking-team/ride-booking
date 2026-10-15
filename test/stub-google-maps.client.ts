import type { GoogleMapsClient } from "../src/infra/google-maps-route.scanner.js";

export class StubGoogleMapsClient implements GoogleMapsClient {
    private readonly cities = new Map<string, string>();
    private readonly meters = new Map<string, number>();
    private readonly addressesWithoutCity = new Set<string>();

    withAddress(address: string, city: string): this {
        this.cities.set(address, city);
        return this;
    }

    withDistance(from: string, to: string, meters: number): this {
        this.meters.set(`${from}->${to}`, meters);
        return this;
    }

    withAddressWithoutCity(address: string): this {
        this.addressesWithoutCity.add(address);
        return this;
    }

    async geocode({ params }: { params: { address: string } }) {
        const results = this.resultsFor(params.address);

        return {
            data: {
                status: results.length > 0 ? "OK" : "ZERO_RESULTS",
                results,
            },
        };
    }

    private resultsFor(address: string) {
        const city = this.cities.get(address);

        if (city) {
            return [{ address_components: [{ long_name: city, types: ["locality", "political"] }] }];
        }

        if (this.addressesWithoutCity.has(address)) {
            return [{ address_components: [{ long_name: "France", types: ["country", "political"] }] }];
        }

        return [];
    }

    async distancematrix({ params }: { params: { origins: string[]; destinations: string[] } }) {
        const meters = this.meters.get(`${params.origins[0]}->${params.destinations[0]}`);

        return {
            data: {
                status: "OK",
                rows: [{
                    elements: [
                        meters === undefined
                            ? { status: "ZERO_RESULTS" }
                            : { status: "OK", distance: { value: meters, text: "" } },
                    ],
                }],
            },
        };
    }
}
