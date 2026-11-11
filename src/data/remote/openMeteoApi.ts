import type { CityDto, ForecastDto, GeocodingDto } from './dtos';
import { HttpStatusError, type HttpClient } from './httpClient';

export const CURRENT_FIELDS =
    'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m';
export const HOURLY_FIELDS =
    'temperature_2m,weather_code,precipitation_probability';
export const DAILY_FIELDS =
    'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

/** The two Open-Meteo endpoints: builds the URLs, sends them, parses the JSON. */
export function createOpenMeteoApi(client: HttpClient) {
    async function getJson<T>(
        url: string,
        signal?: AbortSignal,
    ): Promise<{ dto: T; raw: string }> {
        const { status, body } = await client.get(url, signal);
        if (status < 200 || status >= 300) {
            throw new HttpStatusError(status);
        }
        return { dto: JSON.parse(body) as T, raw: body };
    }

    return {
        /** The decoded forecast **and the raw text**, which the cache stores as it is. */
        forecast(latitude: number, longitude: number, signal?: AbortSignal) {
            const query = new URLSearchParams({
                latitude: String(latitude),
                longitude: String(longitude),
                current: CURRENT_FIELDS,
                hourly: HOURLY_FIELDS,
                daily: DAILY_FIELDS,
                timezone: 'auto',
                forecast_days: '7',
                forecast_hours: '24',
            });
            return getJson<ForecastDto>(`${FORECAST_URL}?${query}`, signal);
        },

        async searchCities(
            name: string,
            languageCode: string,
            signal?: AbortSignal,
        ): Promise<readonly CityDto[]> {
            const query = new URLSearchParams({
                name,
                language: languageCode,
                count: '10',
                format: 'json',
            });
            const { dto } = await getJson<GeocodingDto>(
                `${GEOCODING_URL}?${query}`,
                signal,
            );
            return dto.results ?? [];
        },
    };
}

export type OpenMeteoApi = ReturnType<typeof createOpenMeteoApi>;
