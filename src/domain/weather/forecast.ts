import type { Result } from '../common/result';
import type { Coordinates } from '../location/coordinates';
import type { Temperature, WindSpeed } from '../settings/units';
import type { WeatherCondition } from './weatherCondition';

/**
 * The full forecast for one place. Times are instants (milliseconds since 1970); `timeZone`
 * is the place's IANA zone (`Europe/Istanbul`), so the UI shows Istanbul time even on a phone
 * set to London. `fetchedAt` drives freshness (F-07) and "Updated 2 hours ago" (F-08).
 */
export interface Forecast {
    readonly coordinates: Coordinates;
    readonly timeZone: string;
    readonly current: CurrentWeather;
    readonly hourly: readonly HourlyForecast[];
    readonly daily: readonly DailyForecast[];
    readonly fetchedAt: number;
}

export interface CurrentWeather {
    readonly time: number;
    readonly temperature: Temperature;
    readonly feelsLike: Temperature;
    readonly humidityPercent: number;
    readonly windSpeed: WindSpeed;
    readonly condition: WeatherCondition;
    readonly isDay: boolean;
}

export interface HourlyForecast {
    readonly time: number;
    readonly temperature: Temperature;
    readonly condition: WeatherCondition;
    readonly precipitationChancePercent?: number;
}

export interface DailyForecast {
    /** The start of the day at the place. */
    readonly date: number;
    readonly condition: WeatherCondition;
    readonly minTemperature: Temperature;
    readonly maxTemperature: Temperature;
    readonly sunrise?: number;
    readonly sunset?: number;
}

/**
 * Source of forecasts. The repository only stores and fetches; *when* to fetch is a business
 * rule, in {@link makeGetForecast}.
 */
export interface WeatherRepository {
    /** The last saved forecast for `coordinates`, or `undefined`. */
    cachedForecast(coordinates: Coordinates): Promise<Forecast | undefined>;
    /** Downloads a new forecast and saves it to the cache. */
    fetchForecast(coordinates: Coordinates): Promise<Result<Forecast>>;
}
