import { success, type Result } from '../common/result';
import type { Unsubscribe } from '../common/valueStore';
import { CURRENT_LOCATION, type City, type Place } from './city';
import type { CityRepository } from './repositories';

export const MIN_QUERY_LENGTH = 2;

/**
 * Searches cities by name (US-04). The query is trimmed, and fewer than two characters
 * returns nothing **without** a network call. Debouncing is a UI concern (view model).
 */
export function makeSearchCities(repository: CityRepository) {
    return async (
        query: string,
        languageCode: string,
    ): Promise<Result<readonly City[]>> => {
        const text = query.trim();
        if (text.length < MIN_QUERY_LENGTH) {
            return success([]);
        }
        return repository.search(text, languageCode);
    };
}

export type SaveCityResult = 'saved' | 'alreadySaved';

/** Saves a city to the favourites. Saving the same city twice does nothing (US-05). */
export function makeSaveCity(repository: CityRepository) {
    return async (city: City): Promise<SaveCityResult> => {
        const saved = await repository.getSavedCities();
        if (saved.some(it => it.id === city.id)) {
            return 'alreadySaved';
        }
        await repository.save(city);
        return 'saved';
    };
}

/** Removes a saved city. Saving it again is the "Undo" (US-05). */
export function makeRemoveCity(repository: CityRepository) {
    return (cityId: number): Promise<void> => repository.remove(cityId);
}

/** The places list: the current location first, then the saved cities (US-05). */
export function makeObservePlaces(repository: CityRepository) {
    return (listener: (places: readonly Place[]) => void): Unsubscribe =>
        repository.observeSavedCities(cities =>
            listener([
                CURRENT_LOCATION,
                ...cities.map((city): Place => ({ kind: 'saved', city })),
            ]),
        );
}
