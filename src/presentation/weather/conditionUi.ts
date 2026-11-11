import type { WeatherCondition } from '../../domain';

/**
 * How a condition looks. The domain knows *what* the weather is; only the presentation layer
 * knows how to draw and say it. Emoji are colour glyphs on both platforms, need no icon font
 * and are never mirrored in right-to-left layouts: a sun is still a sun.
 */
const ICONS: Readonly<Record<WeatherCondition, string>> = {
    clear: '☀️',
    mainlyClear: '🌤️',
    partlyCloudy: '⛅',
    overcast: '☁️',
    fog: '🌫️',
    drizzle: '🌦️',
    freezingDrizzle: '🌨️',
    rain: '🌧️',
    freezingRain: '🌨️',
    snow: '❄️',
    rainShowers: '🌧️',
    snowShowers: '🌨️',
    thunderstorm: '⛈️',
    thunderstormWithHail: '⛈️',
    unknown: '❔',
};

/** At night a clear sky shows a moon, not a sun (US-01). */
const NIGHT_ICONS: Readonly<Partial<Record<WeatherCondition, string>>> = {
    clear: '🌙',
    mainlyClear: '🌙',
    partlyCloudy: '☁️',
};

export function conditionIcon(
    condition: WeatherCondition,
    isDay = true,
): string {
    return (!isDay && NIGHT_ICONS[condition]) || ICONS[condition];
}

/** The i18n key, typed: a condition without a translation is a compile error. */
export function conditionLabelKey(condition: WeatherCondition) {
    return `condition.${condition}` as const;
}
