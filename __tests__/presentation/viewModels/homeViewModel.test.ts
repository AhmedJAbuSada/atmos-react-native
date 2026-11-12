import {
    DomainErrors,
    failure,
    makeForecastFreshness,
    makeGetCurrentLocationForecast,
    makeGetForecast,
    success,
    type ForecastSnapshot,
    type Place,
    type Result,
} from '../../../src/domain';
import {
    createHomeViewModel,
    type PermissionAnswer,
} from '../../../src/presentation/viewModels/homeViewModel';
import { createSelectedPlace } from '../../../src/presentation/viewModels/selectedPlace';
import {
    city,
    FakeLocationRepository,
    FakeSettingsRepository,
    FakeWeatherRepository,
    fixedDates,
    forecast,
    NOW,
} from '../../../src/testing';
import { deferred, settle } from '../../support/deferred';

const HOUR = 3_600_000;
const ankara = city(323786, 'Ankara');
const saved = (c = ankara): Place => ({ kind: 'saved', city: c });

function setUp({
    weather = new FakeWeatherRepository(),
    location = new FakeLocationRepository(),
    permission = 'granted' as PermissionAnswer,
    currentLocationLoad = undefined as
        | (() => Promise<Result<ForecastSnapshot>>)
        | undefined,
} = {}) {
    const dates = fixedDates();
    const freshness = makeForecastFreshness(dates);
    const getForecast = makeGetForecast({ repository: weather, freshness });
    const settings = new FakeSettingsRepository();
    const selectedPlace = createSelectedPlace();
    const openAppSettings = jest.fn();
    const requestLocationPermission = jest.fn(async () => permission);
    const viewModel = createHomeViewModel({
        getCurrentLocationForecast:
            currentLocationLoad ??
            makeGetCurrentLocationForecast({
                locations: location,
                getForecast,
            }),
        getForecast,
        freshness,
        selectedPlace,
        settings,
        requestLocationPermission,
        openAppSettings,
    });
    const state = () => viewModel.store.getState();
    return {
        viewModel,
        state,
        weather,
        location,
        settings,
        selectedPlace,
        openAppSettings,
        requestLocationPermission,
    };
}

describe('HomeViewModel', () => {
    test('starts loading, then shows the forecast for the current location (US-01)', async () => {
        const { viewModel, state } = setUp();
        expect(state()).toEqual({ kind: 'loading' });
        viewModel.start();
        await settle();
        expect(state()).toMatchObject({
            kind: 'content',
            content: { refreshing: false },
        });
        expect(state().kind === 'content' && state()).not.toHaveProperty(
            'content.placeName',
        );
    });

    test('given location access is off, then asks with an explanation first (F-02)', async () => {
        const location = new FakeLocationRepository();
        location.fail(DomainErrors.locationPermissionDenied);
        const { viewModel, state } = setUp({ location });
        viewModel.start();
        await settle();
        expect(state()).toEqual({ kind: 'needsLocation' });
    });

    test('allowing location in the system dialog loads the forecast', async () => {
        const location = new FakeLocationRepository();
        location.fail(DomainErrors.locationPermissionDenied);
        const { viewModel, state, requestLocationPermission } = setUp({
            location,
        });
        viewModel.start();
        await settle();
        location.result = success(ankara.coordinates);
        await viewModel.requestLocation();
        expect(requestLocationPermission).toHaveBeenCalledTimes(1);
        expect(state().kind).toBe('content');
    });

    test('given the system will not ask again, then opens the app settings', async () => {
        const { viewModel, openAppSettings, state } = setUp({
            permission: 'blocked',
        });
        await viewModel.requestLocation();
        expect(openAppSettings).toHaveBeenCalledTimes(1);
        expect(state()).toEqual({ kind: 'loading' }); // nothing loaded behind the user's back
    });

    test('given no connection and no cache, then shows the error; Try again recovers', async () => {
        const weather = new FakeWeatherRepository(
            undefined,
            failure(DomainErrors.noConnection),
        );
        const { viewModel, state } = setUp({ weather });
        viewModel.start();
        await settle();
        expect(state()).toEqual({
            kind: 'failed',
            error: DomainErrors.noConnection,
        });
        weather.fetchResult = success(forecast());
        await viewModel.retry();
        expect(state().kind).toBe('content');
    });

    test('given old data and a failed refresh, then shows the data and how old it is (F-08)', async () => {
        const weather = new FakeWeatherRepository(
            forecast(NOW - 2 * HOUR),
            failure(DomainErrors.noConnection),
        );
        const { viewModel, state } = setUp({ weather });
        viewModel.start();
        await settle();
        expect(state()).toMatchObject({
            kind: 'content',
            content: { outdatedByMs: 2 * HOUR },
        });
    });

    test('pull to refresh downloads even fresh data, with the spinner on while it runs (US-06)', async () => {
        const weather = new FakeWeatherRepository(forecast(NOW));
        const { viewModel, state } = setUp({ weather });
        viewModel.start();
        await settle();
        expect(weather.fetchCount).toBe(0); // fresh cache: no download
        const refreshing = viewModel.refresh();
        expect(state()).toMatchObject({ content: { refreshing: true } });
        await refreshing;
        expect(weather.fetchCount).toBe(1);
        expect(state()).toMatchObject({ content: { refreshing: false } });
    });

    test('a city picked in Cities is shown with its name', async () => {
        const { viewModel, state, selectedPlace } = setUp();
        viewModel.start();
        selectedPlace.set(saved());
        await settle();
        expect(state()).toMatchObject({
            kind: 'content',
            content: { placeName: 'Ankara' },
        });
    });

    test('changing the unit updates the screen without a download (US-08)', async () => {
        const { viewModel, state, settings, weather } = setUp();
        viewModel.start();
        await settle();
        const downloads = weather.fetchCount;
        await settings.updateSettings({ temperatureUnit: 'fahrenheit' });
        expect(state()).toMatchObject({
            content: { settings: { temperatureUnit: 'fahrenheit' } },
        });
        expect(weather.fetchCount).toBe(downloads);
    });

    test('an answer for a place the user already left is ignored', async () => {
        const slow = deferred<Result<ForecastSnapshot>>();
        const { viewModel, state, selectedPlace } = setUp({
            currentLocationLoad: () => slow.promise,
        });
        viewModel.start(); // starts loading the current location…
        selectedPlace.set(saved()); // …but the user picks Ankara before it answers
        await settle();
        slow.resolve(failure(DomainErrors.locationPermissionDenied));
        await settle();
        expect(state()).toMatchObject({
            kind: 'content',
            content: { placeName: 'Ankara' },
        });
    });

    test('a cancelled load is never shown (ADR-0006)', async () => {
        const weather = new FakeWeatherRepository(
            undefined,
            failure(DomainErrors.cancelled),
        );
        const { viewModel, state } = setUp({ weather });
        viewModel.start();
        await settle();
        expect(state()).toEqual({ kind: 'loading' });
    });

    test('after stop, a late answer changes nothing', async () => {
        const slow = deferred<Result<ForecastSnapshot>>();
        const { viewModel, state } = setUp({
            currentLocationLoad: () => slow.promise,
        });
        const stop = viewModel.start();
        stop(); // the screen went away
        slow.resolve(success({ forecast: forecast() }));
        await settle();
        expect(state()).toEqual({ kind: 'loading' });
    });
});
