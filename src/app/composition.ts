/**
 * The composition root (ADR-0004): wires repositories → use cases → view models. It takes the
 * data module and the platform as arguments, so the app (`main.tsx`) passes the real ones and
 * the journey test passes fakes: the **same** wiring is tested.
 */
import type { DataModule } from '../data';
import {
    makeForecastFreshness,
    makeGetCachedForecast,
    makeGetCurrentLocationForecast,
    makeGetForecast,
    makeObservePlaces,
    makeRemoveCity,
    makeSaveCity,
    makeSearchCities,
    type DateProvider,
} from '../domain';
import {
    createCitiesViewModel,
    createHomeViewModel,
    createSelectedPlace,
    createSettingsViewModel,
    type CitiesViewModel,
    type HomeViewModel,
    type PermissionAnswer,
    type SettingsViewModel,
} from '../presentation';

/** What the app needs from the phone itself, outside the data layer. */
export interface AppPlatform {
    readonly dates: DateProvider;
    /** The app language ("en", "tr", "ar"), for the names in city search results. */
    readonly languageCode: () => string;
    readonly requestLocationPermission: () => Promise<PermissionAnswer>;
    readonly openAppSettings: () => void;
    readonly openLanguageSettings: () => void;
    readonly openUrl: (url: string) => void;
}

export interface AppDependencies {
    readonly home: HomeViewModel;
    readonly cities: CitiesViewModel;
    readonly settings: SettingsViewModel;
    readonly platform: AppPlatform;
    readonly version: string;
}

export const LINKS = {
    dataSource: 'https://open-meteo.com',
    sourceCode: 'https://github.com/AhmedJAbuSada/atmos-react-native',
} as const;

/** Builds the whole graph from a data module and a platform: real ones, or fakes in tests. */
export function createAppDependencies(
    data: DataModule,
    platform: AppPlatform,
    options: { version: string; debounceMs?: number; noticeMs?: number },
): AppDependencies {
    const freshness = makeForecastFreshness(platform.dates);
    const getForecast = makeGetForecast({
        repository: data.weatherRepository,
        freshness,
    });
    const selectedPlace = createSelectedPlace();
    const cityRepository = data.cityRepository;
    return {
        home: createHomeViewModel({
            getCurrentLocationForecast: makeGetCurrentLocationForecast({
                locations: data.locationRepository,
                getForecast,
            }),
            getForecast,
            freshness,
            selectedPlace,
            settings: data.settingsRepository,
            requestLocationPermission: platform.requestLocationPermission,
            openAppSettings: platform.openAppSettings,
        }),
        cities: createCitiesViewModel({
            searchCities: makeSearchCities(cityRepository),
            saveCity: makeSaveCity(cityRepository),
            removeCity: makeRemoveCity(cityRepository),
            observePlaces: makeObservePlaces(cityRepository),
            getCachedForecast: makeGetCachedForecast(data.weatherRepository),
            settings: data.settingsRepository,
            selectedPlace,
            languageCode: platform.languageCode,
            ...(options.debounceMs !== undefined
                ? { debounceMs: options.debounceMs }
                : {}),
            ...(options.noticeMs !== undefined
                ? { noticeMs: options.noticeMs }
                : {}),
        }),
        settings: createSettingsViewModel(data.settingsRepository),
        platform,
        version: options.version,
    };
}
