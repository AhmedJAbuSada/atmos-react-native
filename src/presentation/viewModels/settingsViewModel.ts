import { createStore, type StoreApi } from 'zustand/vanilla';
import {
    DEFAULT_SETTINGS,
    type SettingsRepository,
    type Unsubscribe,
    type UserSettings,
} from '../../domain';

export interface SettingsViewModel {
    readonly store: StoreApi<UserSettings>;
    start(): Unsubscribe;
    change(change: Partial<UserSettings>): Promise<void>;
}

/**
 * Settings (US-08). Every screen observes the same settings, so a change here updates them all
 * without being told.
 */
export function createSettingsViewModel(
    settings: SettingsRepository,
): SettingsViewModel {
    const store = createStore<UserSettings>(() => DEFAULT_SETTINGS);
    return {
        store,
        start: () =>
            settings.observeSettings(value => store.setState(value, true)),
        async change(change) {
            store.setState(change); // the screen answers at once; the repository confirms it
            await settings.updateSettings(change);
        },
    };
}
