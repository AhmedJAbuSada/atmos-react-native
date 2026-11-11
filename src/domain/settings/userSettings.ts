import type { Unsubscribe } from '../common/valueStore';
import type { TemperatureUnit, WindSpeedUnit } from './units';

export type AppTheme = 'system' | 'light' | 'dark';

/**
 * What the user can change in Settings (F-09). No language here: the app language belongs to
 * the operating system's per-app setting (ADR-0005), so there is only one source of truth.
 */
export interface UserSettings {
    readonly temperatureUnit: TemperatureUnit;
    readonly windSpeedUnit: WindSpeedUnit;
    readonly theme: AppTheme;
}

export const DEFAULT_SETTINGS: UserSettings = {
    temperatureUnit: 'celsius',
    windSpeedUnit: 'kilometersPerHour',
    theme: 'system',
};

/** Stores the settings. Implemented with AsyncStorage in src/data (step 04). */
export interface SettingsRepository {
    /** Calls `listener` with the current settings, then after every change (US-08). */
    observeSettings(listener: (settings: UserSettings) => void): Unsubscribe;
    updateSettings(change: Partial<UserSettings>): Promise<void>;
}
