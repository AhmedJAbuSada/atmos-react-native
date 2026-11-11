import {
    conditionFromWmoCode,
    type Coordinates,
    type CurrentWeather,
    type DailyForecast,
    type Forecast,
    type HourlyForecast,
} from '../../domain';
import type {
    CurrentDto,
    DailyDto,
    ForecastDto,
    HourlyDto,
} from '../remote/dtos';
import { InvalidResponseError } from '../remote/errorMapping';
import { knownTimeZone, parseLocalTime } from './localTime';

const isNumber = (value: number | null | undefined): value is number =>
    typeof value === 'number' && Number.isFinite(value);

/**
 * DTO → domain. Keeps the **requested** coordinates (the API snaps them to its grid, and the
 * cache key must match what we asked for). Throws InvalidResponseError only when the current
 * conditions are missing; a broken hour or day is skipped instead of failing the whole screen.
 */
export function mapForecast(
    dto: ForecastDto,
    requested: Coordinates,
    fetchedAt: number,
): Forecast {
    const timeZone = knownTimeZone(dto.timezone);
    const zone: string | number = timeZone ?? dto.utc_offset_seconds ?? 0;
    const current = dto.current && mapCurrent(dto.current, zone);
    if (!current) {
        throw new InvalidResponseError('missing current conditions');
    }
    return {
        coordinates: requested,
        timeZone: timeZone ?? 'UTC',
        current,
        hourly: dto.hourly ? mapHourly(dto.hourly, zone) : [],
        daily: dto.daily ? mapDaily(dto.daily, zone) : [],
        fetchedAt,
    };
}

function mapCurrent(
    dto: CurrentDto,
    zone: string | number,
): CurrentWeather | undefined {
    const time = parseLocalTime(dto.time, zone);
    const temperature = dto.temperature_2m;
    if (
        time === undefined ||
        !isNumber(temperature) ||
        !isNumber(dto.wind_speed_10m)
    ) {
        return undefined;
    }
    return {
        time,
        temperature: { celsius: temperature },
        feelsLike: {
            celsius: isNumber(dto.apparent_temperature)
                ? dto.apparent_temperature
                : temperature,
        },
        humidityPercent: isNumber(dto.relative_humidity_2m)
            ? dto.relative_humidity_2m
            : 0,
        windSpeed: { kilometersPerHour: dto.wind_speed_10m },
        condition: conditionFromWmoCode(dto.weather_code ?? -1),
        isDay: dto.is_day !== 0,
    };
}

/** Zips the parallel arrays. An index missing from any required array is dropped. */
function mapHourly(dto: HourlyDto, zone: string | number): HourlyForecast[] {
    return (dto.time ?? []).flatMap((text, i) => {
        const time = parseLocalTime(text, zone);
        const temperature = dto.temperature_2m?.[i];
        const code = dto.weather_code?.[i];
        if (time === undefined || !isNumber(temperature) || !isNumber(code)) {
            return [];
        }
        const chance = dto.precipitation_probability?.[i];
        const hour: HourlyForecast = {
            time,
            temperature: { celsius: temperature },
            condition: conditionFromWmoCode(code),
            ...(isNumber(chance) ? { precipitationChancePercent: chance } : {}),
        };
        return [hour];
    });
}

function mapDaily(dto: DailyDto, zone: string | number): DailyForecast[] {
    return (dto.time ?? []).flatMap((text, i) => {
        const date = parseLocalTime(text, zone);
        const min = dto.temperature_2m_min?.[i];
        const max = dto.temperature_2m_max?.[i];
        const code = dto.weather_code?.[i];
        if (
            date === undefined ||
            !isNumber(min) ||
            !isNumber(max) ||
            !isNumber(code)
        ) {
            return [];
        }
        const sunrise = parseLocalTime(dto.sunrise?.[i], zone);
        const sunset = parseLocalTime(dto.sunset?.[i], zone);
        const day: DailyForecast = {
            date,
            condition: conditionFromWmoCode(code),
            minTemperature: { celsius: min },
            maxTemperature: { celsius: max },
            ...(sunrise !== undefined ? { sunrise } : {}),
            ...(sunset !== undefined ? { sunset } : {}),
        };
        return [day];
    });
}
