import type {
    CityRepository,
    DateProvider,
    LocationRepository,
    SettingsRepository,
    WeatherRepository,
} from '../domain';
import type { KeyValueStore } from './local/keyValueStore';
import {
    createLocationRepository,
    type LocationPlatform,
} from './location/locationRepository';
import {
    createFetchHttpClient,
    withRetry,
    type HttpClient,
} from './remote/httpClient';
import { createOpenMeteoApi } from './remote/openMeteoApi';
import { createCityRepository } from './repositories/cityRepository';
import { createSettingsRepository } from './repositories/settingsRepository';
import { createWeatherRepository } from './repositories/weatherRepository';

export interface DataModule {
    readonly weatherRepository: WeatherRepository;
    readonly cityRepository: CityRepository;
    readonly settingsRepository: SettingsRepository;
    readonly locationRepository: LocationRepository;
}

export interface DataModuleOptions {
    readonly store: KeyValueStore;
    readonly location: LocationPlatform;
    readonly dates: DateProvider;
    /** Defaults to `fetch` with retries; tests pass a client that replays the samples. */
    readonly httpClient?: HttpClient;
    /** Sent as the User-Agent: the app name and version, no personal data (API_CONTRACT §4). */
    readonly userAgent?: string;
}

/**
 * The data layer's front door. It returns **domain interfaces only**; nothing outside src/data
 * can name a DTO or a concrete repository.
 */
export function createDataModule(options: DataModuleOptions): DataModule {
    const client =
        options.httpClient ??
        withRetry(createFetchHttpClient(options.userAgent ?? 'Atmos-RN/1.0'));
    const api = createOpenMeteoApi(client);
    return {
        weatherRepository: createWeatherRepository(
            api,
            options.store,
            options.dates,
        ),
        cityRepository: createCityRepository(api, options.store),
        settingsRepository: createSettingsRepository(options.store),
        locationRepository: createLocationRepository(options.location),
    };
}
