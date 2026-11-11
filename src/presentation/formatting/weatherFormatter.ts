import {
    temperatureIn,
    windSpeedIn,
    type Temperature,
    type TemperatureUnit,
    type WindSpeed,
    type WindSpeedUnit,
} from '../../domain';
import { formattingLocale, type AppLanguage } from '../i18n/language';

const LEFT_TO_RIGHT_ISOLATE = '⁦';
const POP_DIRECTIONAL_ISOLATE = '⁩';

/**
 * Keeps `value` left to right and in one piece, whatever text surrounds it (Unicode UAX #9).
 * Without it an Arabic sentence can turn `11°` into `°11`: the bug the Android screenshots
 * found (ADR-0005).
 */
export function isolate(value: string): string {
    return LEFT_TO_RIGHT_ISOLATE + value + POP_DIRECTIONAL_ISOLATE;
}

/**
 * Turns domain values into text for one language and one place's time zone. Why not
 * `` `${value}°` ``? Because the language changes more than the words: Turkish writes `%69` and
 * `6,9 m/s`. Unit symbols (km/h, m/s, mph) are international and are not translated.
 */
export function createWeatherFormatter(
    language: AppLanguage,
    timeZone: string,
) {
    const locale = formattingLocale(language);
    const whole = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
    const oneDecimal = new Intl.NumberFormat(locale, {
        maximumFractionDigits: 1,
    });
    const percent = new Intl.NumberFormat(locale, { style: 'percent' });
    // `timeStyle: 'short'` is each language's own short time: "7:46 AM", Turkish "07:46".
    // (`hour: 'numeric'` would write "7:46" in Turkish, which Turkish does not use.)
    const hour = new Intl.DateTimeFormat(locale, {
        timeStyle: 'short',
        timeZone,
    });
    const weekday = new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        timeZone,
    });
    const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone }); // "2026-11-11"

    // Rounds first, so -0.4 shows as 0°, never -0°.
    const integer = (value: number) => whole.format(Math.round(value) + 0);

    return {
        /** `15°`: whole degrees; decimals add noise to a weather glance. */
        temperature(value: Temperature, unit: TemperatureUnit): string {
            return isolate(`${integer(temperatureIn(value, unit))}°`);
        },

        /** `25 km/h`, `6,9 m/s` in Turkish, `15 mph`. Metres per second keep one decimal. */
        windSpeed(value: WindSpeed, unit: WindSpeedUnit): string {
            const number = windSpeedIn(value, unit);
            switch (unit) {
                case 'kilometersPerHour':
                    return isolate(`${integer(number)} km/h`);
                case 'metersPerSecond':
                    return isolate(`${oneDecimal.format(number)} m/s`);
                case 'milesPerHour':
                    return isolate(`${integer(number)} mph`);
            }
        },

        /** `69%`, `%69` in Turkish. */
        percentage(value: number): string {
            return isolate(percent.format(value / 100));
        },

        /** `2:00 PM` or `14:00`, as the language prefers, **at the place**, not on the phone. */
        hour(epochMs: number): string {
            return isolate(hour.format(epochMs));
        },

        /** `Thursday`, `Perşembe`, `الخميس`. A word, so no isolate. */
        dayName(epochMs: number): string {
            return weekday.format(epochMs);
        },

        /** True when both instants fall on the same calendar day at the place. */
        sameDay(a: number, b: number): boolean {
            return dayKey.format(a) === dayKey.format(b);
        },
    };
}

export type WeatherFormatter = ReturnType<typeof createWeatherFormatter>;

/**
 * "Updated 2 hours ago" (F-08), as an i18n key and a count, so the translation picks the plural
 * form. Under an hour counts minutes, under a day hours, then days.
 */
export function updatedAgo(ageMs: number): {
    key: 'home.updatedMinutes' | 'home.updatedHours' | 'home.updatedDays';
    count: number;
} {
    const minutes = Math.max(0, Math.floor(ageMs / 60_000));
    if (minutes < 60) {
        return { key: 'home.updatedMinutes', count: minutes };
    }
    const hours = Math.floor(minutes / 60);
    return hours < 24
        ? { key: 'home.updatedHours', count: hours }
        : { key: 'home.updatedDays', count: Math.floor(hours / 24) };
}
