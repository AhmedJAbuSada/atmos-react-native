import type { Coordinates } from './coordinates';

/**
 * A city from the geocoding search (F-05) or the saved list (F-06). `id` comes from the
 * geocoding service and is stable, so it identifies a saved city (no duplicates, US-05).
 */
export interface City {
    readonly id: number;
    readonly name: string;
    readonly region?: string;
    readonly country?: string;
    readonly countryCode?: string;
    readonly coordinates: Coordinates;
}

/** An entry in the places list: the current location first, then saved cities (US-05). */
export type Place =
    | { readonly kind: 'currentLocation' }
    | { readonly kind: 'saved'; readonly city: City };

export const CURRENT_LOCATION: Place = { kind: 'currentLocation' };

export function samePlace(a: Place, b: Place): boolean {
    if (a.kind === 'currentLocation' || b.kind === 'currentLocation') {
        return a.kind === b.kind;
    }
    return a.city.id === b.city.id;
}
