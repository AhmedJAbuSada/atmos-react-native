import type { Result } from '../common/result';
import type { Unsubscribe } from '../common/valueStore';
import type { City } from './city';
import type { Coordinates } from './coordinates';

/** The device location. Implemented in src/data (step 04). */
export interface LocationRepository {
    /** The current position, or `locationPermissionDenied` / `locationUnavailable`. */
    currentLocation(): Promise<Result<Coordinates>>;
}

/** City search (remote) and the saved cities (local). */
export interface CityRepository {
    /** Searches by name; `languageCode` selects the language of the returned names. */
    search(
        query: string,
        languageCode: string,
    ): Promise<Result<readonly City[]>>;
    /** Saved cities, oldest first. */
    getSavedCities(): Promise<readonly City[]>;
    /** Calls `listener` with the saved cities, then after every change. */
    observeSavedCities(
        listener: (cities: readonly City[]) => void,
    ): Unsubscribe;
    /** Saves `city`; a city already saved keeps its position. */
    save(city: City): Promise<void>;
    remove(cityId: number): Promise<void>;
}
