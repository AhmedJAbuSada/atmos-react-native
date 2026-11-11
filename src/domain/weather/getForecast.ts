import type { DateProvider } from '../common/dateProvider';
import type { DomainError } from '../common/domainError';
import { success, type Result } from '../common/result';
import type { Coordinates } from '../location/coordinates';
import type { LocationRepository } from '../location/repositories';
import type { Forecast, WeatherRepository } from './forecast';

/** Data younger than this is shown as-is, with no download (US-06). */
export const MAX_FORECAST_AGE_MS = 30 * 60 * 1000;

export function makeForecastFreshness(dates: DateProvider) {
    const age = (forecast: Forecast): number =>
        dates.now() - forecast.fetchedAt;
    return {
        age,
        isFresh: (forecast: Forecast): boolean =>
            age(forecast) < MAX_FORECAST_AGE_MS,
    };
}

export type ForecastFreshness = ReturnType<typeof makeForecastFreshness>;

/**
 * What a screen gets: the forecast, plus the reason it is outdated when a refresh failed, so
 * the UI shows "Updated 2 hours ago" instead of an error (F-08).
 */
export interface ForecastSnapshot {
    readonly forecast: Forecast;
    readonly refreshError?: DomainError;
}

/**
 * Gets the forecast for a place, cache first (US-06, US-07).
 *
 * | Cache       | forceRefresh | Network  | Result                                 |
 * |-------------|--------------|----------|----------------------------------------|
 * | fresh       | false        | not used | cached                                 |
 * | fresh       | true         | ok       | new                                    |
 * | stale/none  | any          | ok       | new                                    |
 * | stale/fresh | any          | fails    | cached, marked outdated with the error |
 * | none        | any          | fails    | the error                              |
 *
 * A cancelled download is never hidden behind old data.
 */
export function makeGetForecast(deps: {
    repository: WeatherRepository;
    freshness: ForecastFreshness;
}) {
    return async (
        coordinates: Coordinates,
        forceRefresh = false,
    ): Promise<Result<ForecastSnapshot>> => {
        const cached = await deps.repository.cachedForecast(coordinates);
        if (!forceRefresh && cached && deps.freshness.isFresh(cached)) {
            return success({ forecast: cached });
        }
        const fetched = await deps.repository.fetchForecast(coordinates);
        if (fetched.ok) {
            return success({ forecast: fetched.value });
        }
        if (cached && fetched.error.kind !== 'cancelled') {
            return success({ forecast: cached, refreshError: fetched.error });
        }
        return fetched;
    };
}

export type GetForecast = ReturnType<typeof makeGetForecast>;

/** The last known forecast, **without** a download: for the Cities list. */
export function makeGetCachedForecast(repository: WeatherRepository) {
    return (coordinates: Coordinates): Promise<Forecast | undefined> =>
        repository.cachedForecast(coordinates);
}

/**
 * The forecast where the user is now (US-01). A location error (permission denied) is
 * returned as-is, so the UI can offer city search instead (F-02).
 */
export function makeGetCurrentLocationForecast(deps: {
    locations: LocationRepository;
    getForecast: GetForecast;
}) {
    return async (forceRefresh = false): Promise<Result<ForecastSnapshot>> => {
        const location = await deps.locations.currentLocation();
        return location.ok
            ? deps.getForecast(location.value, forceRefresh)
            : location;
    };
}
