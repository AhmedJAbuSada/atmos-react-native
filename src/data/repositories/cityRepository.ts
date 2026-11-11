import {
    failure,
    success,
    ValueStore,
    type City,
    type CityRepository,
} from '../../domain';
import { readJson, type KeyValueStore } from '../local/keyValueStore';
import { mapCities } from '../mappers/cityMapper';
import { toDomainError } from '../remote/errorMapping';
import type { OpenMeteoApi } from '../remote/openMeteoApi';

export const SAVED_CITIES_KEY = 'savedCities';

/** Search is remote; the saved list is local, loaded once and kept in a ValueStore. */
export function createCityRepository(
    api: OpenMeteoApi,
    store: KeyValueStore,
): CityRepository {
    const saved = new ValueStore<readonly City[]>([]);
    let loading: Promise<void> | undefined;

    const load = () =>
        (loading ??= readJson<City[]>(store, SAVED_CITIES_KEY).then(cities => {
            saved.set(Array.isArray(cities) ? cities : []);
        }));

    const write = async (cities: readonly City[]) => {
        saved.set(cities);
        await store.setItem(SAVED_CITIES_KEY, JSON.stringify(cities));
    };

    return {
        async search(query, languageCode) {
            try {
                return success(
                    mapCities(await api.searchCities(query, languageCode)),
                );
            } catch (error) {
                return failure(toDomainError(error));
            }
        },

        async getSavedCities() {
            await load();
            return saved.get();
        },

        observeSavedCities(listener) {
            // Starts loading; the listener hears the stored value when it arrives.
            load().catch(() => undefined);
            return saved.subscribe(listener);
        },

        async save(city) {
            await load();
            const cities = saved.get();
            if (!cities.some(existing => existing.id === city.id)) {
                await write([...cities, city]);
            }
        },

        async remove(cityId) {
            await load();
            await write(saved.get().filter(city => city.id !== cityId));
        },
    };
}
