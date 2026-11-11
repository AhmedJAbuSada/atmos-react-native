import type { DomainError, Forecast, UserSettings } from '../../domain';

/**
 * Everything the Home screen can show. The view is a pure function of this value, so every
 * state is rendered in tests without a store (ARCHITECTURE §Presentation).
 */
export type HomeState =
    /** First load, nothing cached: the skeleton (US-09). */
    | { readonly kind: 'loading' }
    /** No permission and no saved city: offer both ways forward (F-02). */
    | { readonly kind: 'needsLocation' }
    /** Nothing to show, and the load failed. */
    | { readonly kind: 'failed'; readonly error: DomainError }
    | { readonly kind: 'content'; readonly content: HomeContent };

export interface HomeContent {
    /** The city name, or `undefined` for the current location. */
    readonly placeName?: string;
    readonly forecast: Forecast;
    readonly settings: UserSettings;
    /** Set when a refresh failed and the data is old (F-08): its age in milliseconds. */
    readonly outdatedByMs?: number;
    /** A pull-to-refresh is running. */
    readonly refreshing: boolean;
}

/** What the user can do on Home. The view reports; whoever owns the screen decides (step 06). */
export interface HomeActions {
    readonly onRefresh: () => void;
    readonly onRetry: () => void;
    readonly onRequestLocation: () => void;
    readonly onOpenCities: () => void;
    readonly onOpenSettings: () => void;
}
