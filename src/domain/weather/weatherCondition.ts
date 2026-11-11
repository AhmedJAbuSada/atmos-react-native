/** What the sky is doing, independent of any provider or language. */
export type WeatherCondition =
    | 'clear'
    | 'mainlyClear'
    | 'partlyCloudy'
    | 'overcast'
    | 'fog'
    | 'drizzle'
    | 'freezingDrizzle'
    | 'rain'
    | 'freezingRain'
    | 'snow'
    | 'rainShowers'
    | 'snowShowers'
    | 'thunderstorm'
    | 'thunderstormWithHail'
    /** A code we do not know. Shown with a neutral icon; it must never crash the app. */
    | 'unknown';

/** The WMO weather interpretation codes (API_CONTRACT §3), as a table. */
const BY_WMO_CODE: Readonly<Record<number, WeatherCondition>> = {
    0: 'clear',
    1: 'mainlyClear',
    2: 'partlyCloudy',
    3: 'overcast',
    45: 'fog',
    48: 'fog',
    51: 'drizzle',
    53: 'drizzle',
    55: 'drizzle',
    56: 'freezingDrizzle',
    57: 'freezingDrizzle',
    61: 'rain',
    63: 'rain',
    65: 'rain',
    66: 'freezingRain',
    67: 'freezingRain',
    71: 'snow',
    73: 'snow',
    75: 'snow',
    77: 'snow',
    80: 'rainShowers',
    81: 'rainShowers',
    82: 'rainShowers',
    85: 'snowShowers',
    86: 'snowShowers',
    95: 'thunderstorm',
    96: 'thunderstormWithHail',
    99: 'thunderstormWithHail',
};

export function conditionFromWmoCode(
    code: number | null | undefined,
): WeatherCondition {
    return (
        (code === null || code === undefined ? undefined : BY_WMO_CODE[code]) ??
        'unknown'
    );
}
