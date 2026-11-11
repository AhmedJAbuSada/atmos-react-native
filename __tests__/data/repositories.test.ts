import {
    DomainErrors,
    DEFAULT_SETTINGS,
    type City,
    type UserSettings,
} from '../../src/domain';
import { cacheKey } from '../../src/data/local/cacheKey';
import { createInMemoryStore } from '../../src/data/local/keyValueStore';
import { createOpenMeteoApi } from '../../src/data/remote/openMeteoApi';
import {
    createCityRepository,
    SAVED_CITIES_KEY,
} from '../../src/data/repositories/cityRepository';
import {
    createSettingsRepository,
    SETTINGS_KEY,
} from '../../src/data/repositories/settingsRepository';
import { createWeatherRepository } from '../../src/data/repositories/weatherRepository';
import {
    city,
    coordinates,
    fixedDates,
    ISTANBUL,
    NOW,
} from '../../src/testing';
import {
    networkError,
    ok,
    replayingClient,
    sample,
    status,
} from '../support/samples';

describe('cacheKey', () => {
    test('rounds to two decimals and always uses a dot', () => {
        expect(cacheKey(coordinates(41.0138, 28.9497))).toBe(
            'forecast:41.01,28.95',
        );
    });
});

describe('WeatherRepository', () => {
    const setUp = (...replies: Parameters<typeof replayingClient>) => {
        const store = createInMemoryStore();
        const repository = createWeatherRepository(
            createOpenMeteoApi(replayingClient(...replies)),
            store,
            fixedDates(),
        );
        return { store, repository };
    };

    test('a downloaded forecast is mapped and saved as the raw response', async () => {
        const { store, repository } = setUp(
            ok(sample('forecast_istanbul.json')),
        );
        const result = await repository.fetchForecast(ISTANBUL);
        expect(result.ok && result.value.current.temperature).toEqual({
            celsius: 14.9,
        });
        const saved = JSON.parse(store.entries.get(cacheKey(ISTANBUL)) ?? '{}');
        expect(saved).toEqual({
            raw: sample('forecast_istanbul.json'),
            fetchedAt: NOW,
        });
    });

    test('the cache gives back the same forecast with its fetch time', async () => {
        const { repository } = setUp(ok(sample('forecast_istanbul.json')));
        const fetched = await repository.fetchForecast(ISTANBUL);
        const cached = await repository.cachedForecast(ISTANBUL);
        expect(fetched.ok && cached).toEqual(fetched.ok && fetched.value);
        expect(cached?.fetchedAt).toBe(NOW);
    });

    test('nothing cached is undefined', async () => {
        await expect(
            setUp().repository.cachedForecast(ISTANBUL),
        ).resolves.toBeUndefined();
    });

    test('an unreadable cache is "no cache", never a crash', async () => {
        const { store, repository } = setUp();
        store.entries.set(cacheKey(ISTANBUL), 'not json');
        await expect(
            repository.cachedForecast(ISTANBUL),
        ).resolves.toBeUndefined();
        store.entries.set(
            cacheKey(ISTANBUL),
            JSON.stringify({ raw: '{}', fetchedAt: NOW }),
        );
        await expect(
            repository.cachedForecast(ISTANBUL),
        ).resolves.toBeUndefined();
    });

    test('given no network, then fails with noConnection and keeps the old cache', async () => {
        const { store, repository } = setUp(
            networkError(),
            networkError(),
            networkError(),
        );
        store.entries.set(cacheKey(ISTANBUL), 'old');
        // The real client retries; this one replays failures without waiting.
        await expect(repository.fetchForecast(ISTANBUL)).resolves.toEqual({
            ok: false,
            error: DomainErrors.noConnection,
        });
        expect(store.entries.get(cacheKey(ISTANBUL))).toBe('old');
    });

    test('given HTTP 400, then fails with a server error', async () => {
        const { repository } = setUp(
            status(400, sample('forecast_error.json')),
        );
        await expect(repository.fetchForecast(ISTANBUL)).resolves.toEqual({
            ok: false,
            error: DomainErrors.server(400),
        });
    });
});

describe('CityRepository', () => {
    const ankara: City = city(323786, 'Ankara');
    const izmir: City = city(311046, 'İzmir');

    test('search maps the recorded results in the requested language', async () => {
        const client = replayingClient(
            ok(sample('geocoding_istanbul_ar.json')),
        );
        const repository = createCityRepository(
            createOpenMeteoApi(client),
            createInMemoryStore(),
        );
        const result = await repository.search('istanbul', 'ar');
        expect(result.ok && result.value[0]?.name).toBe('اسطنبول');
        expect(client.urls[0]).toContain('language=ar');
    });

    test('given no network, then search fails with noConnection', async () => {
        const client = replayingClient(networkError());
        const repository = createCityRepository(
            createOpenMeteoApi(client),
            createInMemoryStore(),
        );
        await expect(repository.search('istanbul', 'en')).resolves.toEqual({
            ok: false,
            error: DomainErrors.noConnection,
        });
    });

    test('saved cities survive a restart, oldest first, without duplicates', async () => {
        const store = createInMemoryStore();
        const api = createOpenMeteoApi(replayingClient());
        const first = createCityRepository(api, store);
        await first.save(ankara);
        await first.save(izmir);
        await first.save(ankara);
        const afterRestart = createCityRepository(api, store);
        await expect(afterRestart.getSavedCities()).resolves.toEqual([
            ankara,
            izmir,
        ]);
    });

    test('remove deletes one city and observers hear every change', async () => {
        const store = createInMemoryStore({
            [SAVED_CITIES_KEY]: JSON.stringify([ankara, izmir]),
        });
        const repository = createCityRepository(
            createOpenMeteoApi(replayingClient()),
            store,
        );
        const heard: number[][] = [];
        const stop = repository.observeSavedCities(cities =>
            heard.push(cities.map(c => c.id)),
        );
        await repository.remove(ankara.id);
        stop();
        await repository.remove(izmir.id);
        expect(heard).toEqual([[], [ankara.id, izmir.id], [izmir.id]]);
    });

    test('unreadable saved cities are an empty list', async () => {
        const store = createInMemoryStore({
            [SAVED_CITIES_KEY]: '{"not": "a list"}',
        });
        const repository = createCityRepository(
            createOpenMeteoApi(replayingClient()),
            store,
        );
        await expect(repository.getSavedCities()).resolves.toEqual([]);
    });
});

describe('SettingsRepository', () => {
    const observe = (
        repository: ReturnType<typeof createSettingsRepository>,
    ) => {
        const heard: UserSettings[] = [];
        repository.observeSettings(settings => heard.push(settings));
        return heard;
    };

    test('starts with the defaults and saves a change', async () => {
        const store = createInMemoryStore();
        const repository = createSettingsRepository(store);
        const heard = observe(repository);
        await repository.updateSettings({ temperatureUnit: 'fahrenheit' });
        expect(heard).toEqual([
            DEFAULT_SETTINGS,
            { ...DEFAULT_SETTINGS, temperatureUnit: 'fahrenheit' },
        ]);
        expect(
            JSON.parse(store.entries.get(SETTINGS_KEY) ?? '{}').temperatureUnit,
        ).toBe('fahrenheit');
    });

    test('reads the stored settings after a restart', async () => {
        const store = createInMemoryStore({
            [SETTINGS_KEY]: JSON.stringify({
                ...DEFAULT_SETTINGS,
                theme: 'dark',
            }),
        });
        const repository = createSettingsRepository(store);
        await repository.updateSettings({});
        expect(observe(repository)).toEqual([
            { ...DEFAULT_SETTINGS, theme: 'dark' },
        ]);
    });

    test('given unknown stored values, then those fields fall back to the defaults', async () => {
        const store = createInMemoryStore({
            [SETTINGS_KEY]: JSON.stringify({
                temperatureUnit: 'kelvin',
                theme: 'dark',
            }),
        });
        const repository = createSettingsRepository(store);
        await repository.updateSettings({});
        expect(observe(repository)).toEqual([
            { ...DEFAULT_SETTINGS, theme: 'dark' },
        ]);
    });
});
