import { createDataModule } from '../../src/data/dataModule';
import { createInMemoryStore } from '../../src/data/local/keyValueStore';
import { makeGetForecast, makeForecastFreshness } from '../../src/domain';
import { fixedDates, ISTANBUL } from '../../src/testing';
import { ok, replayingClient, sample } from '../support/samples';

describe('createDataModule', () => {
    test('the repositories work end to end with a domain use case', async () => {
        const dates = fixedDates();
        const data = createDataModule({
            store: createInMemoryStore(),
            location: {
                checkPermission: async () => 'granted',
                currentPosition: async () => ({
                    latitude: 41.01,
                    longitude: 28.97,
                }),
            },
            dates,
            httpClient: replayingClient(ok(sample('forecast_istanbul.json'))),
        });
        const getForecast = makeGetForecast({
            repository: data.weatherRepository,
            freshness: makeForecastFreshness(dates),
        });

        const downloaded = await getForecast(ISTANBUL);
        // Fresh, so no second download: the replaying client has no second reply to give.
        const fromCache = await getForecast(ISTANBUL);

        expect(
            downloaded.ok && downloaded.value.forecast.current.temperature,
        ).toEqual({ celsius: 14.9 });
        expect(fromCache).toEqual(downloaded);
        await expect(
            data.locationRepository.currentLocation(),
        ).resolves.toMatchObject({ ok: true });
    });
});
