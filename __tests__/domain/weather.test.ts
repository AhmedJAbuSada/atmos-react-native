import {
    conditionFromWmoCode,
    failure,
    makeForecastFreshness,
    makeGetCachedForecast,
    makeGetCurrentLocationForecast,
    makeGetForecast,
    success,
    DomainErrors,
    type WeatherCondition,
} from '../../src/domain';
import {
    FakeLocationRepository,
    FakeWeatherRepository,
    fixedDates,
    forecast,
    ISTANBUL,
    NOW,
} from '../../src/testing';

const MINUTE = 60 * 1000;

describe('WeatherCondition', () => {
    it.each<[number, WeatherCondition]>([
        [0, 'clear'],
        [1, 'mainlyClear'],
        [2, 'partlyCloudy'],
        [3, 'overcast'],
        [45, 'fog'],
        [48, 'fog'],
        [51, 'drizzle'],
        [53, 'drizzle'],
        [55, 'drizzle'],
        [56, 'freezingDrizzle'],
        [57, 'freezingDrizzle'],
        [61, 'rain'],
        [63, 'rain'],
        [65, 'rain'],
        [66, 'freezingRain'],
        [67, 'freezingRain'],
        [71, 'snow'],
        [73, 'snow'],
        [75, 'snow'],
        [77, 'snow'],
        [80, 'rainShowers'],
        [81, 'rainShowers'],
        [82, 'rainShowers'],
        [85, 'snowShowers'],
        [86, 'snowShowers'],
        [95, 'thunderstorm'],
        [96, 'thunderstormWithHail'],
        [99, 'thunderstormWithHail'],
    ])('WMO code %p is %p', (code, condition) => {
        expect(conditionFromWmoCode(code)).toBe(condition);
    });

    it.each([4, -1, null, undefined])(
        'an unknown or missing code (%p) is "unknown", never a crash',
        code => {
            expect(conditionFromWmoCode(code)).toBe('unknown');
        },
    );
});

describe('ForecastFreshness', () => {
    const freshness = makeForecastFreshness(fixedDates());

    it('data fetched 29 minutes ago is fresh', () => {
        expect(freshness.isFresh(forecast(NOW - 29 * MINUTE))).toBe(true);
    });

    it('data fetched exactly 30 minutes ago is stale', () => {
        expect(freshness.isFresh(forecast(NOW - 30 * MINUTE))).toBe(false);
    });

    it('age is measured from the fetch time', () => {
        expect(freshness.age(forecast(NOW - 120 * MINUTE))).toBe(120 * MINUTE);
    });
});

/** One test per row of the table in makeGetForecast's documentation. */
describe('getForecast', () => {
    const fresh = forecast(NOW - 5 * MINUTE);
    const stale = forecast(NOW - 120 * MINUTE);
    const downloaded = forecast(NOW);

    function setUp(repository: FakeWeatherRepository) {
        return makeGetForecast({
            repository,
            freshness: makeForecastFreshness(fixedDates()),
        });
    }

    it('given fresh cache, when loading, then returns it without a download', async () => {
        const repository = new FakeWeatherRepository(fresh);
        expect(await setUp(repository)(ISTANBUL)).toEqual(
            success({ forecast: fresh }),
        );
        expect(repository.fetchCount).toBe(0);
    });

    it('given fresh cache, when pulling to refresh, then downloads anyway', async () => {
        const repository = new FakeWeatherRepository(
            fresh,
            success(downloaded),
        );
        expect(await setUp(repository)(ISTANBUL, true)).toEqual(
            success({ forecast: downloaded }),
        );
        expect(repository.fetchCount).toBe(1);
    });

    it.each([
        ['stale', stale],
        ['no', undefined],
    ])(
        'given %s cache, when loading, then downloads',
        async (_label, cached) => {
            const repository = new FakeWeatherRepository(
                cached,
                success(downloaded),
            );
            expect(await setUp(repository)(ISTANBUL)).toEqual(
                success({ forecast: downloaded }),
            );
        },
    );

    it('given stale cache and no connection, then returns the cache marked outdated', async () => {
        const repository = new FakeWeatherRepository(
            stale,
            failure(DomainErrors.noConnection),
        );
        expect(await setUp(repository)(ISTANBUL)).toEqual(
            success({
                forecast: stale,
                refreshError: DomainErrors.noConnection,
            }),
        );
    });

    it('given no cache and no connection, then returns the error', async () => {
        const repository = new FakeWeatherRepository(
            undefined,
            failure(DomainErrors.noConnection),
        );
        expect(await setUp(repository)(ISTANBUL)).toEqual(
            failure(DomainErrors.noConnection),
        );
    });

    it('a cancelled download is never hidden behind old data', async () => {
        const repository = new FakeWeatherRepository(
            stale,
            failure(DomainErrors.cancelled),
        );
        expect(await setUp(repository)(ISTANBUL)).toEqual(
            failure(DomainErrors.cancelled),
        );
    });

    it('the cached forecast is read without a download', async () => {
        const repository = new FakeWeatherRepository(stale);
        expect(await makeGetCachedForecast(repository)(ISTANBUL)).toEqual(
            stale,
        );
        expect(repository.fetchCount).toBe(0);
    });
});

describe('getCurrentLocationForecast', () => {
    it('given a location, then returns its forecast', async () => {
        const weather = new FakeWeatherRepository();
        const getForecast = makeGetForecast({
            repository: weather,
            freshness: makeForecastFreshness(fixedDates()),
        });
        const useCase = makeGetCurrentLocationForecast({
            locations: new FakeLocationRepository(),
            getForecast,
        });

        expect(await useCase()).toEqual(success({ forecast: forecast() }));
    });

    it('given permission is denied, then returns that error without fetching weather', async () => {
        const weather = new FakeWeatherRepository();
        const locations = new FakeLocationRepository(
            failure(DomainErrors.locationPermissionDenied),
        );
        const getForecast = makeGetForecast({
            repository: weather,
            freshness: makeForecastFreshness(fixedDates()),
        });

        expect(
            await makeGetCurrentLocationForecast({ locations, getForecast })(),
        ).toEqual(failure(DomainErrors.locationPermissionDenied));
        expect(weather.fetchCount).toBe(0);
    });
});
