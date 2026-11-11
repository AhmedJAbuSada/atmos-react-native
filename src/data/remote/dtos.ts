/**
 * The Open-Meteo responses **exactly as the JSON looks** (API_CONTRACT §1, §2). DTOs never
 * leave src/data. Every field is optional: the API is outside our control, and a missing field
 * must not crash the app. The mappers decide what is truly required.
 */
export interface ForecastDto {
    readonly latitude?: number;
    readonly longitude?: number;
    readonly timezone?: string;
    readonly utc_offset_seconds?: number;
    readonly current?: CurrentDto;
    readonly hourly?: HourlyDto;
    readonly daily?: DailyDto;
}

export interface CurrentDto {
    readonly time?: string;
    readonly temperature_2m?: number | null;
    readonly apparent_temperature?: number | null;
    readonly relative_humidity_2m?: number | null;
    readonly wind_speed_10m?: number | null;
    readonly weather_code?: number | null;
    readonly is_day?: number | null;
}

/** Parallel arrays: index `i` of every list belongs to `time[i]`. */
export interface HourlyDto {
    readonly time?: readonly string[];
    readonly temperature_2m?: readonly (number | null)[];
    readonly weather_code?: readonly (number | null)[];
    readonly precipitation_probability?: readonly (number | null)[];
}

/** Parallel arrays: index `i` of every list belongs to `time[i]`. */
export interface DailyDto {
    readonly time?: readonly string[];
    readonly weather_code?: readonly (number | null)[];
    readonly temperature_2m_max?: readonly (number | null)[];
    readonly temperature_2m_min?: readonly (number | null)[];
    readonly sunrise?: readonly (string | null)[];
    readonly sunset?: readonly (string | null)[];
}

/**
 * When nothing matches, the API **omits `results` entirely** instead of sending `[]`
 * (docs/api/samples/geocoding_empty.json).
 */
export interface GeocodingDto {
    readonly results?: readonly CityDto[];
}

export interface CityDto {
    readonly id?: number;
    readonly name?: string;
    readonly latitude?: number;
    readonly longitude?: number;
    readonly country_code?: string;
    readonly country?: string;
    readonly admin1?: string;
}
