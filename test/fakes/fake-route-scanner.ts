import { AddressNotFoundError } from "../../src/domain/errors/address-not-found-error.js";
import type { RouteScanner, ScannedRoute } from "../../src/domain/ports/route.scanner.js";

export class FakeRouteScanner implements RouteScanner {
    private readonly routes = new Map<string, ScannedRoute>();

    withRoute(from: string, to: string, route: ScannedRoute): this {
        this.routes.set(key(from, to), { ...route });
        return this;
    }

    async scan(from: string, to: string): Promise<ScannedRoute> {
        const route = this.routes.get(key(from, to));

        if (!route) {
            throw new AddressNotFoundError(this.knowsAddress(from) ? to : from);
        }

        // Comme le vrai scanner, le fake ne partage jamais ses objets.
        return { ...route };
    }

    private knowsAddress(address: string): boolean {
        return [...this.routes.keys()].some((k) => k.startsWith(`${address}->`));
    }
}

function key(from: string, to: string): string {
    return `${from}->${to}`;
}
