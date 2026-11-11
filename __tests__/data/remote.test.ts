import { DomainErrors } from '../../src/domain';
import {
    InvalidResponseError,
    toDomainError,
} from '../../src/data/remote/errorMapping';
import {
    CancelledError,
    createFetchHttpClient,
    HttpStatusError,
    TimeoutError,
    withRetry,
} from '../../src/data/remote/httpClient';
import { createOpenMeteoApi } from '../../src/data/remote/openMeteoApi';
import {
    networkError,
    ok,
    replayingClient,
    sample,
    status,
} from '../support/samples';

describe('withRetry (API_CONTRACT §4)', () => {
    const run = (...replies: Parameters<typeof replayingClient>) => {
        const client = replayingClient(...replies);
        const delays: number[] = [];
        const retrying = withRetry(client, {
            sleep: async ms => {
                delays.push(ms);
            },
        });
        return { client, delays, get: () => retrying.get('https://x.test') };
    };

    test('retries a network error with back-off, 1 s then 2 s', async () => {
        const { client, delays, get } = run(
            networkError(),
            networkError(),
            ok('{}'),
        );
        await expect(get()).resolves.toEqual({ status: 200, body: '{}' });
        expect(client.urls).toHaveLength(3);
        expect(delays).toEqual([1000, 2000]);
    });

    test('retries HTTP 5xx, then gives back the last answer', async () => {
        const { client, get } = run(status(503), status(502), status(500));
        await expect(get()).resolves.toMatchObject({ status: 500 });
        expect(client.urls).toHaveLength(3);
    });

    test('does not retry HTTP 4xx: our request is wrong', async () => {
        const { client, get } = run(status(400, sample('forecast_error.json')));
        await expect(get()).resolves.toMatchObject({ status: 400 });
        expect(client.urls).toHaveLength(1);
    });

    test('does not retry a cancellation: the user left', async () => {
        const { client, get } = run({ error: new CancelledError('x') });
        await expect(get()).rejects.toBeInstanceOf(CancelledError);
        expect(client.urls).toHaveLength(1);
    });

    test('given the network stays down, then fails after two retries', async () => {
        const { client, get } = run(
            networkError(),
            networkError(),
            networkError(),
        );
        await expect(get()).rejects.toBeInstanceOf(TypeError);
        expect(client.urls).toHaveLength(3);
    });
});

describe('createFetchHttpClient', () => {
    const realFetch = globalThis.fetch;
    afterEach(() => {
        globalThis.fetch = realFetch;
    });

    /** A fetch that never answers, but rejects like the real one when aborted. */
    const hangingFetch = jest.fn(
        (_url: unknown, init?: RequestInit) =>
            new Promise<Response>((_resolve, reject) => {
                init?.signal?.addEventListener('abort', () =>
                    reject(new Error('Aborted')),
                );
            }),
    );

    test('returns status and body and sends the User-Agent', async () => {
        const fetchMock = jest.fn(
            async () =>
                ({ status: 200, text: async () => 'hello' } as Response),
        );
        globalThis.fetch = fetchMock as typeof fetch;
        const client = createFetchHttpClient('Atmos-Test/1.0');
        await expect(client.get('https://x.test')).resolves.toEqual({
            status: 200,
            body: 'hello',
        });
        expect(fetchMock).toHaveBeenCalledWith(
            'https://x.test',
            expect.objectContaining({
                headers: { 'User-Agent': 'Atmos-Test/1.0' },
            }),
        );
    });

    test('given no answer in time, then fails with TimeoutError', async () => {
        globalThis.fetch = hangingFetch as typeof fetch;
        const client = createFetchHttpClient('Atmos-Test/1.0', 10);
        await expect(client.get('https://x.test')).rejects.toBeInstanceOf(
            TimeoutError,
        );
    });

    test('given the caller cancels, then fails with CancelledError', async () => {
        globalThis.fetch = hangingFetch as typeof fetch;
        const controller = new AbortController();
        const request = createFetchHttpClient('Atmos-Test/1.0').get(
            'https://x.test',
            controller.signal,
        );
        controller.abort();
        await expect(request).rejects.toBeInstanceOf(CancelledError);
    });

    test('a network failure is passed on as it is', async () => {
        globalThis.fetch = jest.fn(async () => {
            throw new TypeError('Network request failed');
        }) as typeof fetch;
        await expect(
            createFetchHttpClient('Atmos-Test/1.0').get('https://x.test'),
        ).rejects.toBeInstanceOf(TypeError);
    });
});

describe('toDomainError: the only translation table', () => {
    test.each([
        [new TypeError('Network request failed'), DomainErrors.noConnection],
        [new TimeoutError('x'), DomainErrors.timeout],
        [new CancelledError('x'), DomainErrors.cancelled],
        [new HttpStatusError(404), DomainErrors.notFound],
        [new HttpStatusError(400), DomainErrors.server(400)],
        [new HttpStatusError(503), DomainErrors.server(503)],
        [new SyntaxError('Unexpected token'), DomainErrors.unknown],
        [new InvalidResponseError('x'), DomainErrors.unknown],
        ['a string', DomainErrors.unknown],
    ])('%p becomes %p', (error, expected) => {
        expect(toDomainError(error)).toEqual(expected);
    });
});

describe('createOpenMeteoApi', () => {
    test('asks for exactly the forecast fields the app shows', async () => {
        const client = replayingClient(ok(sample('forecast_istanbul.json')));
        const { dto, raw } = await createOpenMeteoApi(client).forecast(
            41.01,
            28.97,
        );
        const url = new URL(client.urls[0] ?? '');
        expect(url.origin + url.pathname).toBe(
            'https://api.open-meteo.com/v1/forecast',
        );
        expect(Object.fromEntries(url.searchParams)).toEqual({
            latitude: '41.01',
            longitude: '28.97',
            current:
                'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
            hourly: 'temperature_2m,weather_code,precipitation_probability',
            daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
            timezone: 'auto',
            forecast_days: '7',
            forecast_hours: '24',
        });
        expect(dto.timezone).toBe('Europe/Istanbul');
        expect(raw).toBe(sample('forecast_istanbul.json'));
    });

    test('searches in the app language and encodes the query', async () => {
        const client = replayingClient(
            ok(sample('geocoding_istanbul_tr.json')),
        );
        const results = await createOpenMeteoApi(client).searchCities(
            'İstanbul',
            'tr',
        );
        const url = new URL(client.urls[0] ?? '');
        expect(url.searchParams.get('name')).toBe('İstanbul');
        expect(url.searchParams.get('language')).toBe('tr');
        expect(url.searchParams.get('count')).toBe('10');
        expect(results[0]?.id).toBe(745044);
    });

    test('a search without a results key is an empty list', async () => {
        const client = replayingClient(ok(sample('geocoding_empty.json')));
        await expect(
            createOpenMeteoApi(client).searchCities('zzzz', 'en'),
        ).resolves.toEqual([]);
    });

    test('given HTTP 400 (the recorded error), then throws HttpStatusError', async () => {
        const client = replayingClient(
            status(400, sample('forecast_error.json')),
        );
        await expect(
            createOpenMeteoApi(client).forecast(999, 0),
        ).rejects.toEqual(new HttpStatusError(400));
    });
});
