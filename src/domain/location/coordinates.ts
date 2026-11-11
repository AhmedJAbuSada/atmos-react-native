declare const valid: unique symbol;

/**
 * A point on Earth in decimal degrees. A *branded* type: the only way to get one is
 * {@link makeCoordinates}, which refuses impossible values, so the rest of the app never has
 * to check them (the API answers 400 for latitude 999).
 */
export interface Coordinates {
    readonly latitude: number;
    readonly longitude: number;
    readonly [valid]: true;
}

export function makeCoordinates(
    latitude: number,
    longitude: number,
): Coordinates | undefined {
    const inRange = Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
    return inRange ? ({ latitude, longitude } as Coordinates) : undefined;
}
