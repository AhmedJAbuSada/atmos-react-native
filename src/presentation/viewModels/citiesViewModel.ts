import { createStore, type StoreApi } from 'zustand/vanilla';
import {
    MIN_QUERY_LENGTH,
    type City,
    type Forecast,
    type Coordinates,
    type Place,
    type Result,
    type SaveCityResult,
    type SettingsRepository,
    type Unsubscribe,
} from '../../domain';
import type {
    CitiesNotice,
    CitiesState,
    PlaceItem,
} from '../cities/citiesState';
import { cityRemoved, type SelectedPlace } from './selectedPlace';

export interface CitiesViewModelDeps {
    readonly searchCities: (
        query: string,
        languageCode: string,
    ) => Promise<Result<readonly City[]>>;
    readonly saveCity: (city: City) => Promise<SaveCityResult>;
    readonly removeCity: (cityId: number) => Promise<void>;
    readonly observePlaces: (
        listener: (places: readonly Place[]) => void,
    ) => Unsubscribe;
    readonly getCachedForecast: (
        coordinates: Coordinates,
    ) => Promise<Forecast | undefined>;
    readonly settings: SettingsRepository;
    readonly selectedPlace: SelectedPlace;
    /** The app language, so results come back with names in it ("İstanbul", "اسطنبول"). */
    readonly languageCode: () => string;
    /** Waits this long after the last keystroke before searching (US-04). */
    readonly debounceMs?: number;
    /** How long "Ankara removed · Undo" stays (US-05). */
    readonly noticeMs?: number;
}

export interface CitiesViewModel {
    readonly store: StoreApi<CitiesState>;
    start(): Unsubscribe;
    queryChanged(query: string): void;
    retrySearch(): void;
    add(city: City): Promise<void>;
    remove(city: City): Promise<void>;
    undo(): Promise<void>;
    select(place: Place): void;
}

/** City search and the saved places (US-04, US-05). */
export function createCitiesViewModel(
    deps: CitiesViewModelDeps,
): CitiesViewModel {
    const { debounceMs = 300, noticeMs = 5000 } = deps;
    const store = createStore<CitiesState>(() => ({
        query: '',
        search: { kind: 'idle' },
        places: [],
        temperatureUnit: 'celsius',
    }));
    let searchTimer: ReturnType<typeof setTimeout> | undefined;
    let noticeTimer: ReturnType<typeof setTimeout> | undefined;
    let searchGeneration = 0;
    let placesGeneration = 0;

    function queryChanged(query: string): void {
        store.setState({ query });
        clearTimeout(searchTimer);
        const token = ++searchGeneration;
        const text = query.trim();
        if (text.length < MIN_QUERY_LENGTH) {
            store.setState({ search: { kind: 'idle' } });
            return;
        }
        // Each keystroke restarts the wait, so typing "istanbul" sends one request, not eight.
        searchTimer = setTimeout(async () => {
            store.setState({ search: { kind: 'searching' } });
            const result = await deps.searchCities(text, deps.languageCode());
            if (token !== searchGeneration) {
                return; // a newer query is on its way; this answer is out of date
            }
            if (result.ok) {
                store.setState({
                    search:
                        result.value.length > 0
                            ? { kind: 'results', cities: result.value }
                            : { kind: 'noResults' },
                });
            } else if (result.error.kind !== 'cancelled') {
                store.setState({
                    search: { kind: 'failed', error: result.error },
                });
            }
        }, debounceMs);
    }

    function show(notice: CitiesNotice): void {
        store.setState({ notice });
        clearTimeout(noticeTimer);
        noticeTimer = setTimeout(() => {
            if (store.getState().notice === notice) {
                store.setState({ notice: undefined });
            }
        }, noticeMs);
    }

    /** Each place with its last known weather, from the cache only: no download per row. */
    async function showPlaces(places: readonly Place[]): Promise<void> {
        const token = ++placesGeneration;
        const items = await Promise.all(
            places.map(async (place): Promise<PlaceItem> => {
                if (place.kind === 'currentLocation') {
                    return { place };
                }
                const cached = await deps.getCachedForecast(
                    place.city.coordinates,
                );
                return cached
                    ? {
                          place,
                          temperature: cached.current.temperature,
                          condition: cached.current.condition,
                      }
                    : { place };
            }),
        );
        if (token === placesGeneration) {
            store.setState({ places: items });
        }
    }

    return {
        store,

        start() {
            const stopPlaces = deps.observePlaces(places => {
                showPlaces(places).catch(() => undefined);
            });
            const stopSettings = deps.settings.observeSettings(settings =>
                store.setState({ temperatureUnit: settings.temperatureUnit }),
            );
            return () => {
                stopPlaces();
                stopSettings();
                clearTimeout(searchTimer);
                clearTimeout(noticeTimer);
                searchGeneration += 1;
                placesGeneration += 1;
            };
        },

        queryChanged,

        retrySearch: () => queryChanged(store.getState().query),

        async add(city) {
            if ((await deps.saveCity(city)) === 'saved') {
                queryChanged(''); // back to the list, where the new city now is
            } else {
                show({ kind: 'alreadySaved', city });
            }
        },

        async remove(city) {
            await deps.removeCity(city.id);
            cityRemoved(deps.selectedPlace, city);
            show({ kind: 'removed', city });
        },

        /** Saving the city again restores it (US-05). */
        async undo() {
            const { notice } = store.getState();
            if (notice?.kind !== 'removed') {
                return;
            }
            store.setState({ notice: undefined });
            await deps.saveCity(notice.city);
        },

        select: place => deps.selectedPlace.set(place),
    };
}
