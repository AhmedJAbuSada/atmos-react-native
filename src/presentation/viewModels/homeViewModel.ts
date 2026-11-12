import { createStore, type StoreApi } from 'zustand/vanilla';
import {
    CURRENT_LOCATION,
    DEFAULT_SETTINGS,
    samePlace,
    type ForecastFreshness,
    type ForecastSnapshot,
    type GetForecast,
    type Place,
    type Result,
    type SettingsRepository,
    type Unsubscribe,
    type UserSettings,
} from '../../domain';
import type { HomeState } from '../home/homeState';
import type { SelectedPlace } from './selectedPlace';

/** What the system permission dialog answered. `blocked`: it will not ask again. */
export type PermissionAnswer = 'granted' | 'denied' | 'blocked';

export interface HomeViewModelDeps {
    readonly getCurrentLocationForecast: (
        forceRefresh?: boolean,
    ) => Promise<Result<ForecastSnapshot>>;
    readonly getForecast: GetForecast;
    readonly freshness: ForecastFreshness;
    readonly selectedPlace: SelectedPlace;
    readonly settings: SettingsRepository;
    /** Shows the system dialog. Asking is a UI decision, so it lives here, not in src/data. */
    readonly requestLocationPermission: () => Promise<PermissionAnswer>;
    /** The app's page in the system settings, where a blocked permission can be turned on. */
    readonly openAppSettings: () => void;
}

export interface HomeViewModel {
    readonly store: StoreApi<HomeState>;
    /** Starts following the selected place and the settings; returns the stop function. */
    start(): Unsubscribe;
    /** Pull to refresh: always downloads (US-06). */
    refresh(): Promise<void>;
    retry(): Promise<void>;
    /** "Allow location": the explanation was on screen, now the system dialog (US-01). */
    requestLocation(): Promise<void>;
}

/**
 * Turns use-case results into a {@link HomeState} (US-01, US-06, US-07). Presentation logic
 * only: which state to show and when to load. The business rules (freshness, offline fallback)
 * stay in the use cases from step 03, which is why this file is short.
 */
export function createHomeViewModel(deps: HomeViewModelDeps): HomeViewModel {
    const store = createStore<HomeState>(() => ({ kind: 'loading' }));
    let place: Place = CURRENT_LOCATION;
    let settings: UserSettings = DEFAULT_SETTINGS;
    let loaded: { place: Place; snapshot: ForecastSnapshot } | undefined;
    let refreshing = false;
    // Every load gets a number. A result whose number is not the latest is ignored: the user
    // picked another city, or the screen went away, while it was on its way.
    let generation = 0;

    const showsPlace = () =>
        loaded !== undefined && samePlace(loaded.place, place);

    function render(): void {
        if (!loaded || !showsPlace()) {
            return;
        }
        const { snapshot } = loaded;
        store.setState({
            kind: 'content',
            content: {
                ...(place.kind === 'saved'
                    ? { placeName: place.city.name }
                    : {}),
                forecast: snapshot.forecast,
                settings,
                // Old data says how old it is only when a refresh failed (F-08).
                ...(snapshot.refreshError
                    ? { outdatedByMs: deps.freshness.age(snapshot.forecast) }
                    : {}),
                refreshing,
            },
        });
    }

    async function load(forceRefresh: boolean): Promise<void> {
        const token = ++generation;
        const target = place;
        if (!showsPlace()) {
            store.setState({ kind: 'loading' });
        }
        const result =
            target.kind === 'currentLocation'
                ? await deps.getCurrentLocationForecast(forceRefresh)
                : await deps.getForecast(target.city.coordinates, forceRefresh);
        if (token !== generation) {
            return; // replaced by a newer load
        }
        if (result.ok) {
            loaded = { place: target, snapshot: result.value };
            render();
            return;
        }
        switch (result.error.kind) {
            case 'cancelled':
                return; // never shown (ADR-0006)
            case 'locationPermissionDenied':
                store.setState({ kind: 'needsLocation' });
                return;
            default:
                // A failed load keeps what is on screen; only an empty screen shows the error.
                if (!showsPlace()) {
                    store.setState({ kind: 'failed', error: result.error });
                }
        }
    }

    return {
        store,

        start() {
            const stopPlace = deps.selectedPlace.subscribe(next => {
                place = next;
                load(false).catch(() => undefined);
            });
            const stopSettings = deps.settings.observeSettings(next => {
                settings = next;
                render(); // °C → °F updates the screen without a download (US-08)
            });
            return () => {
                stopPlace();
                stopSettings();
                generation += 1; // results still on their way are ignored
            };
        },

        async refresh() {
            refreshing = true;
            render();
            try {
                await load(true);
            } finally {
                refreshing = false;
                render();
            }
        },

        retry: () => load(false),

        async requestLocation() {
            const answer = await deps.requestLocationPermission();
            if (answer === 'granted') {
                await load(false);
            } else if (answer === 'blocked') {
                deps.openAppSettings(); // the system will not show the dialog again
            }
        },
    };
}
