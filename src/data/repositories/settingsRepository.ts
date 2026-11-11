import {
    DEFAULT_SETTINGS,
    ValueStore,
    type SettingsRepository,
    type UserSettings,
} from '../../domain';
import { readJson, type KeyValueStore } from '../local/keyValueStore';

export const SETTINGS_KEY = 'settings';

const sameSettings = (a: UserSettings, b: UserSettings) =>
    a.temperatureUnit === b.temperatureUnit &&
    a.windSpeedUnit === b.windSpeedUnit &&
    a.theme === b.theme;

/** Allowed values only: a stored value from an older version cannot break the app. */
function sanitize(stored: Partial<UserSettings> | undefined): UserSettings {
    const pick = <K extends keyof UserSettings>(
        key: K,
        allowed: readonly UserSettings[K][],
    ) =>
        stored && allowed.includes(stored[key] as UserSettings[K])
            ? (stored[key] as UserSettings[K])
            : DEFAULT_SETTINGS[key];
    return {
        temperatureUnit: pick('temperatureUnit', ['celsius', 'fahrenheit']),
        windSpeedUnit: pick('windSpeedUnit', [
            'kilometersPerHour',
            'metersPerSecond',
            'milesPerHour',
        ]),
        theme: pick('theme', ['system', 'light', 'dark']),
    };
}

export function createSettingsRepository(
    store: KeyValueStore,
): SettingsRepository {
    const settings = new ValueStore<UserSettings>(
        DEFAULT_SETTINGS,
        sameSettings,
    );
    let loading: Promise<void> | undefined;
    const load = () =>
        (loading ??= readJson<Partial<UserSettings>>(store, SETTINGS_KEY).then(
            stored => {
                settings.set(sanitize(stored));
            },
        ));

    return {
        observeSettings(listener) {
            // Starts loading; the listener hears the stored value when it arrives.
            load().catch(() => undefined);
            return settings.subscribe(listener);
        },
        async updateSettings(change) {
            await load();
            const next = sanitize({ ...settings.get(), ...change });
            settings.set(next);
            await store.setItem(SETTINGS_KEY, JSON.stringify(next));
        },
    };
}
