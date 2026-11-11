/** Unit the user wants temperatures shown in (F-09). */
export type TemperatureUnit = 'celsius' | 'fahrenheit';

/** Unit the user wants wind speed shown in (F-09). */
export type WindSpeedUnit =
    | 'kilometersPerHour'
    | 'metersPerSecond'
    | 'milesPerHour';

/**
 * A temperature, stored in Celsius as the API returns it and converted only for display, so
 * changing the unit never needs a download (US-08). A dedicated type keeps a wind speed from
 * being passed where a temperature is expected.
 */
export interface Temperature {
    readonly celsius: number;
}

export interface WindSpeed {
    readonly kilometersPerHour: number;
}

const KMH_PER_MS = 3.6;
const KMH_PER_MPH = 1.609344;

export function temperatureIn(
    temperature: Temperature,
    unit: TemperatureUnit,
): number {
    return unit === 'celsius'
        ? temperature.celsius
        : (temperature.celsius * 9) / 5 + 32;
}

export function windSpeedIn(speed: WindSpeed, unit: WindSpeedUnit): number {
    switch (unit) {
        case 'kilometersPerHour':
            return speed.kilometersPerHour;
        case 'metersPerSecond':
            return speed.kilometersPerHour / KMH_PER_MS;
        case 'milesPerHour':
            return speed.kilometersPerHour / KMH_PER_MPH;
    }
}
