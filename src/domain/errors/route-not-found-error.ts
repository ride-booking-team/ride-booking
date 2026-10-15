export class RouteNotFoundError extends Error {
    constructor(readonly from: string, readonly to: string) {
        super(`no route from ${from} to ${to}`);
        this.name = "RouteNotFoundError";
    }
}
