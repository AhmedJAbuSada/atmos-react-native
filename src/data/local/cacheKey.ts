import type { Coordinates } from '../../domain';

/**
 * "41.01,28.97": two decimals (about 1 km) so tiny GPS changes reuse the cache. `toFixed`
 * ignores the phone's language, so a Turkish phone never writes "41,01".
 */
export function cacheKey(coordinates: Coordinates): string {
    return `forecast:${coordinates.latitude.toFixed(
        2,
    )},${coordinates.longitude.toFixed(2)}`;
}
