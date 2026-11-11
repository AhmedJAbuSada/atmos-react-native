import {
    failure,
    success,
    type Coordinates,
    type DateProvider,
    type Forecast,
    type Result,
    type WeatherRepository,
} from '../../domain';
import { cacheKey } from '../local/cacheKey';
import { readJson, type KeyValueStore } from '../local/keyValueStore';
import type { ForecastDto } from '../remote/dtos';
import { toDomainError } from '../remote/errorMapping';
import type { OpenMeteoApi } from '../remote/openMeteoApi';
import { mapForecast } from '../mappers/forecastMapper';

/** What the cache stores: the response **as received**, so a mapper fix also fixes old data. */
interface CachedForecast {
    readonly raw: string;
    readonly fetchedAt: number;
}

export function createWeatherRepository(
    api: OpenMeteoApi,
    store: KeyValueStore,
    dates: DateProvider,
): WeatherRepository {
    return {
        async cachedForecast(coordinates) {
            const entry = await readJson<CachedForecast>(
                store,
                cacheKey(coordinates),
            );
            if (!entry) {
                return undefined;
            }
            try {
                return mapForecast(
                    JSON.parse(entry.raw) as ForecastDto,
                    coordinates,
                    entry.fetchedAt,
                );
            } catch {
                return undefined; // an unreadable cache is "no cache"
            }
        },

        async fetchForecast(
            coordinates: Coordinates,
        ): Promise<Result<Forecast>> {
            try {
                const { dto, raw } = await api.forecast(
                    coordinates.latitude,
                    coordinates.longitude,
                );
                const fetchedAt = dates.now();
                const forecast = mapForecast(dto, coordinates, fetchedAt);
                const entry: CachedForecast = { raw, fetchedAt };
                await store.setItem(
                    cacheKey(coordinates),
                    JSON.stringify(entry),
                );
                return success(forecast);
            } catch (error) {
                return failure(toDomainError(error));
            }
        },
    };
}
