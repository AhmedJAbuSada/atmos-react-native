/**
 * In-memory fakes of the domain interfaces, shared by every layer's tests (the equivalent of
 * Gradle test fixtures and the iOS AtmosTesting target). ESLint forbids production code from
 * importing this folder.
 */
import {
    failure,
    makeCoordinates,
    success,
    ValueStore,
    DEFAULT_SETTINGS,
    type City,
    type CityRepository,
    type Coordinates,
    type DateProvider,
    type DomainError,
    type Forecast,
    type LocationRepository,
    type Result,
    type SettingsRepository,
    type Unsubscribe,
    type UserSettings,
    type WeatherRepository,
} from '../domain';

export const NOW = Date.UTC(2026, 10, 11, 7, 15); // 2026-11-11 07:15 UTC

export function coordinates(latitude: number, longitude: number): Coordinates {
    const value = makeCoordinates(latitude, longitude);
    if (!value) {
        throw new Error('Invalid test coordinates');
    }
    return value;
}

export const ISTANBUL = coordinates(41.01, 28.97);

export function fixedDates(now = NOW): DateProvider {
    return { now: () => now };
}

export function forecast(
    fetchedAt = NOW,
    place: Coordinates = ISTANBUL,
): Forecast {
    return {
        coordinates: place,
        timeZone: 'Europe/Istanbul',
        current: {
            time: NOW,
            temperature: { celsius: 14.9 },
            feelsLike: { celsius: 11.2 },
            humidityPercent: 69,
            windSpeed: { kilometersPerHour: 24.8 },
            condition: 'overcast',
            isDay: true,
        },
        hourly: [],
        daily: [],
        fetchedAt,
    };
}

export function city(id: number, name = 'City'): City {
    return {
        id,
        name,
        country: 'Türkiye',
        countryCode: 'TR',
        coordinates: coordinates(39.92, 32.85),
    };
}

export class FakeWeatherRepository implements WeatherRepository {
    fetchCount = 0;

    constructor(
        public cached: Forecast | undefined = undefined,
        public fetchResult: Result<Forecast> = success(forecast()),
    ) {}

    async cachedForecast(): Promise<Forecast | undefined> {
        return this.cached;
    }

    async fetchForecast(): Promise<Result<Forecast>> {
        this.fetchCount += 1;
        if (this.fetchResult.ok) {
            this.cached = this.fetchResult.value;
        }
        return this.fetchResult;
    }
}

export class FakeCityRepository implements CityRepository {
    readonly searches: Array<{ query: string; languageCode: string }> = [];
    private readonly saved = new ValueStore<readonly City[]>([]);

    constructor(public searchResult: Result<readonly City[]> = success([])) {}

    async search(
        query: string,
        languageCode: string,
    ): Promise<Result<readonly City[]>> {
        this.searches.push({ query, languageCode });
        return this.searchResult;
    }

    async getSavedCities(): Promise<readonly City[]> {
        return this.saved.get();
    }

    observeSavedCities(
        listener: (cities: readonly City[]) => void,
    ): Unsubscribe {
        return this.saved.subscribe(listener);
    }

    async save(newCity: City): Promise<void> {
        const list = this.saved.get();
        if (!list.some(it => it.id === newCity.id)) {
            this.saved.set([...list, newCity]);
        }
    }

    async remove(cityId: number): Promise<void> {
        this.saved.set(this.saved.get().filter(it => it.id !== cityId));
    }
}

export class FakeLocationRepository implements LocationRepository {
    constructor(public result: Result<Coordinates> = success(ISTANBUL)) {}

    async currentLocation(): Promise<Result<Coordinates>> {
        return this.result;
    }

    fail(error: DomainError): void {
        this.result = failure(error);
    }
}

export class FakeSettingsRepository implements SettingsRepository {
    readonly store = new ValueStore<UserSettings>(DEFAULT_SETTINGS);

    observeSettings(listener: (settings: UserSettings) => void): Unsubscribe {
        return this.store.subscribe(listener);
    }

    async updateSettings(change: Partial<UserSettings>): Promise<void> {
        this.store.set({ ...this.store.get(), ...change });
    }
}
