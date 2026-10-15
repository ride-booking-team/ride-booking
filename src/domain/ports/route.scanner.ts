export type ScannedRoute = {
    departureCity: string;
    destinationCity: string;
    distanceKm: number;
};

export interface RouteScanner {
    scan(from: string, to: string): Promise<ScannedRoute>;
}