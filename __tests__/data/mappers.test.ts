import { mapCities, mapCity } from '../../src/data/mappers/cityMapper';
import { mapForecast } from '../../src/data/mappers/forecastMapper';
import type { ForecastDto, GeocodingDto } from '../../src/data/remote/dtos';
import { InvalidResponseError } from '../../src/data/remote/errorMapping';
import { ISTANBUL, NOW } from '../../src/testing';
import { sample } from '../support/samples';

const istanbul = (text: string) => {
    // Istanbul is UTC+3 all year.
    const [date = '', time = '00:00'] = text.split('T');
    const [y, m, d] = date.split('-').map(Number);
    const [h, min] = time.split(':').map(Number);
    return Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1, (h ?? 0) - 3, min ?? 0);
};

describe('mapForecast', () => {
    const recorded = () =>
        mapForecast(
            JSON.parse(sample('forecast_istanbul.json')) as ForecastDto,
            ISTANBUL,
            NOW,
        );

    test('maps the current conditions of the recorded Istanbul response', () => {
        expect(recorded().current).toEqual({
            time: istanbul('2026-11-11T10:15'),
            temperature: { celsius: 14.9 },
            feelsLike: { celsius: 11.2 },
            humidityPercent: 69,
            windSpeed: { kilometersPerHour: 24.8 },
            condition: 'overcast',
            isDay: true,
        });
        expect(recorded().timeZone).toBe('Europe/Istanbul');
        expect(recorded().fetchedAt).toBe(NOW);
    });

    test('zips the parallel hourly arrays into 24 hours', () => {
        const { hourly } = recorded();
        expect(hourly).toHaveLength(24);
        expect(hourly[0]).toEqual({
            time: istanbul('2026-11-11T10:00'),
            temperature: { celsius: 14.8 },
            condition: 'partlyCloudy',
            precipitationChancePercent: 0,
        });
    });

    test('maps 7 days with sunrise and sunset', () => {
        const { daily } = recorded();
        expect(daily).toHaveLength(7);
        expect(daily[0]).toMatchObject({
            date: istanbul('2026-11-11'),
            minTemperature: { celsius: 11.4 },
            maxTemperature: { celsius: 16.9 },
            sunrise: istanbul('2026-11-11T07:46'),
            sunset: istanbul('2026-11-11T17:49'),
        });
    });

    test('keeps the requested coordinates, not the snapped ones from the response', () => {
        expect(recorded().coordinates).toBe(ISTANBUL); // response says 41.02444, 28.940546
    });

    test('given no current conditions, then the response is invalid', () => {
        expect(() => mapForecast({}, ISTANBUL, NOW)).toThrow(
            InvalidResponseError,
        );
    });

    test('given arrays of different lengths, then maps only complete hours instead of crashing', () => {
        const dto: ForecastDto = {
            timezone: 'UTC',
            current: {
                time: '2026-11-11T10:15',
                temperature_2m: 15,
                wind_speed_10m: 10,
            },
            hourly: {
                time: [
                    '2026-11-11T10:00',
                    '2026-11-11T11:00',
                    '2026-11-11T12:00',
                ],
                temperature_2m: [14.8, null],
                weather_code: [2],
            },
        };
        const forecast = mapForecast(dto, ISTANBUL, NOW);
        expect(forecast.hourly).toHaveLength(1);
        expect(forecast.hourly[0]?.precipitationChancePercent).toBeUndefined();
        expect(forecast.current.feelsLike).toEqual({ celsius: 15 }); // falls back to the temperature
        expect(forecast.daily).toEqual([]);
    });

    test('an unknown time zone falls back to the UTC offset', () => {
        const forecast = mapForecast(
            {
                timezone: 'Mars/Olympus_Mons',
                utc_offset_seconds: 10_800,
                current: {
                    time: '2026-11-11T10:15',
                    temperature_2m: 15,
                    wind_speed_10m: 10,
                },
            },
            ISTANBUL,
            NOW,
        );
        expect(forecast.current.time).toBe(Date.UTC(2026, 10, 11, 7, 15));
        expect(forecast.timeZone).toBe('UTC');
    });
});

describe('mapCities', () => {
    const cities = (name: Parameters<typeof sample>[0]) =>
        mapCities((JSON.parse(sample(name)) as GeocodingDto).results ?? []);

    test('maps the recorded Turkish search with Turkish names', () => {
        expect(cities('geocoding_istanbul_tr.json')[0]).toMatchObject({
            id: 745044,
            name: 'İstanbul',
            countryCode: 'TR',
        });
    });

    test('maps the recorded Arabic search with Arabic names', () => {
        expect(cities('geocoding_istanbul_ar.json')[0]?.name).toBe('اسطنبول');
    });

    test('the same city has the same id in every language', () => {
        const ids = (['en', 'tr', 'ar'] as const).map(
            lang => cities(`geocoding_istanbul_${lang}.json`)[0]?.id,
        );
        expect(new Set(ids)).toEqual(new Set([745044]));
    });

    test('a response with no results key is an empty list', () => {
        // The real API omits "results" when nothing matches.
        expect(cities('geocoding_empty.json')).toEqual([]);
    });

    test('drops results that cannot be shown or saved', () => {
        const base = {
            id: 1,
            name: 'Ankara',
            latitude: 39.9,
            longitude: 32.8,
            country: ' ',
            admin1: '',
        };
        expect(mapCity(base)?.name).toBe('Ankara');
        expect(mapCity(base)?.country).toBeUndefined(); // a blank country is dropped
        expect(mapCity({ ...base, id: undefined })).toBeUndefined();
        expect(mapCity({ ...base, name: ' ' })).toBeUndefined();
        expect(mapCity({ ...base, latitude: 999 })).toBeUndefined();
    });
});
