import type {
    City,
    DomainError,
    Place,
    Temperature,
    TemperatureUnit,
    WeatherCondition,
} from '../../domain';

/** The Cities screen (US-04, US-05): a search field over the saved places. */
export interface CitiesState {
    readonly query: string;
    readonly search: SearchState;
    readonly places: readonly PlaceItem[];
    readonly temperatureUnit: TemperatureUnit;
    /** A short message under the list; "removed" offers Undo (US-05). */
    readonly notice?: CitiesNotice;
}

/** The area under the search field. `idle` shows the saved places instead. */
export type SearchState =
    | { readonly kind: 'idle' }
    | { readonly kind: 'searching' }
    | { readonly kind: 'results'; readonly cities: readonly City[] }
    | { readonly kind: 'noResults' }
    | { readonly kind: 'failed'; readonly error: DomainError };

export type CitiesNotice =
    | { readonly kind: 'removed'; readonly city: City }
    | { readonly kind: 'alreadySaved'; readonly city: City };

/** A row in the places list, with its last known weather when there is one. */
export interface PlaceItem {
    readonly place: Place;
    readonly temperature?: Temperature;
    readonly condition?: WeatherCondition;
}

export interface CitiesActions {
    readonly onQueryChange: (query: string) => void;
    readonly onRetrySearch: () => void;
    readonly onAdd: (city: City) => void;
    readonly onRemove: (city: City) => void;
    readonly onSelect: (place: Place) => void;
    readonly onUndo: () => void;
    readonly onBack: () => void;
}

/** A stable id for lists and tests: `current` or `city-745044`. */
export function placeId(place: Place): string {
    return place.kind === 'currentLocation'
        ? 'current'
        : `city-${place.city.id}`;
}
