import {
    CURRENT_LOCATION,
    DomainErrors,
    failure,
    makeObservePlaces,
    makeRemoveCity,
    makeSaveCity,
    makeSearchCities,
    success,
    type City,
    type Forecast,
    type Result,
} from '../../../src/domain';
import {
    createCitiesViewModel,
    type CitiesViewModelDeps,
} from '../../../src/presentation/viewModels/citiesViewModel';
import { deferred } from '../../support/deferred';
import { createSelectedPlace } from '../../../src/presentation/viewModels/selectedPlace';
import {
    city,
    FakeCityRepository,
    FakeSettingsRepository,
    forecast,
} from '../../../src/testing';

const ankara: City = city(323786, 'Ankara');
const izmir: City = city(311046, 'İzmir');

function setUp({
    cached = undefined as Forecast | undefined,
    search = undefined as CitiesViewModelDeps['searchCities'] | undefined,
} = {}) {
    const cities = new FakeCityRepository(success([ankara]));
    const settings = new FakeSettingsRepository();
    const selectedPlace = createSelectedPlace();
    const viewModel = createCitiesViewModel({
        searchCities: search ?? makeSearchCities(cities),
        saveCity: makeSaveCity(cities),
        removeCity: makeRemoveCity(cities),
        observePlaces: makeObservePlaces(cities),
        getCachedForecast: async () => cached,
        settings,
        selectedPlace,
        languageCode: () => 'tr',
    });
    const state = () => viewModel.store.getState();
    return { viewModel, state, cities, settings, selectedPlace };
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('CitiesViewModel: search (US-04)', () => {
    test('waits 300 ms after the last keystroke, then searches once, in the app language', async () => {
        const { viewModel, state, cities } = setUp();
        viewModel.queryChanged('an');
        await jest.advanceTimersByTimeAsync(200);
        viewModel.queryChanged('ank');
        await jest.advanceTimersByTimeAsync(299);
        expect(cities.searches).toEqual([]);
        await jest.advanceTimersByTimeAsync(1);
        expect(cities.searches).toEqual([{ query: 'ank', languageCode: 'tr' }]);
        expect(state().search).toEqual({ kind: 'results', cities: [ankara] });
    });

    test('fewer than two characters shows the saved places, with no request', async () => {
        const { viewModel, state, cities } = setUp();
        viewModel.queryChanged(' a ');
        await jest.advanceTimersByTimeAsync(1000);
        expect(cities.searches).toEqual([]);
        expect(state().search).toEqual({ kind: 'idle' });
    });

    test('no match says so', async () => {
        const { viewModel, state, cities } = setUp();
        cities.searchResult = success([]);
        viewModel.queryChanged('zzzz');
        await jest.advanceTimersByTimeAsync(300);
        expect(state().search).toEqual({ kind: 'noResults' });
    });

    test('given a failed search, then shows the error; Try again searches again', async () => {
        const { viewModel, state, cities } = setUp();
        cities.searchResult = failure(DomainErrors.noConnection);
        viewModel.queryChanged('ank');
        await jest.advanceTimersByTimeAsync(300);
        expect(state().search).toEqual({
            kind: 'failed',
            error: DomainErrors.noConnection,
        });
        cities.searchResult = success([ankara]);
        viewModel.retrySearch();
        await jest.advanceTimersByTimeAsync(300);
        expect(state().search.kind).toBe('results');
    });

    test('a late answer for an older query is ignored', async () => {
        const slow = deferred<Result<readonly City[]>>();
        const { viewModel, state } = setUp({ search: () => slow.promise });
        viewModel.queryChanged('ank');
        await jest.advanceTimersByTimeAsync(300); // "ank" is sent…
        viewModel.queryChanged(''); // …the user clears the field…
        slow.resolve(success([ankara])); // …and then the answer arrives
        await jest.advanceTimersByTimeAsync(0);
        expect(state().search).toEqual({ kind: 'idle' });
    });
});

describe('CitiesViewModel: saved places (US-05)', () => {
    test('lists the current location first, with the last known weather from the cache', async () => {
        const { viewModel, state, cities } = setUp({ cached: forecast() });
        await cities.save(ankara);
        viewModel.start();
        await jest.advanceTimersByTimeAsync(0);
        expect(state().places).toEqual([
            { place: CURRENT_LOCATION },
            {
                place: { kind: 'saved', city: ankara },
                temperature: { celsius: 14.9 },
                condition: 'overcast',
            },
        ]);
    });

    test('adding a city clears the search and shows it in the list', async () => {
        const { viewModel, state } = setUp();
        viewModel.start();
        viewModel.queryChanged('ank');
        await viewModel.add(ankara);
        await jest.advanceTimersByTimeAsync(0);
        expect(state().query).toBe('');
        expect(state().places.map(item => item.place)).toContainEqual({
            kind: 'saved',
            city: ankara,
        });
    });

    test('adding a city twice says it is already saved', async () => {
        const { viewModel, state, cities } = setUp();
        await cities.save(ankara);
        await viewModel.add(ankara);
        expect(state().notice).toEqual({ kind: 'alreadySaved', city: ankara });
    });

    test('remove, then Undo within 5 seconds, brings the city back', async () => {
        const { viewModel, state, cities } = setUp();
        await cities.save(ankara);
        await cities.save(izmir);
        await viewModel.remove(ankara);
        expect(await cities.getSavedCities()).toEqual([izmir]);
        expect(state().notice).toEqual({ kind: 'removed', city: ankara });
        await viewModel.undo();
        expect(state().notice).toBeUndefined();
        expect(await cities.getSavedCities()).toEqual([izmir, ankara]);
    });

    test('the Undo notice disappears after 5 seconds', async () => {
        const { viewModel, state, cities } = setUp();
        await cities.save(ankara);
        await viewModel.remove(ankara);
        await jest.advanceTimersByTimeAsync(4999);
        expect(state().notice).toBeDefined();
        await jest.advanceTimersByTimeAsync(1);
        expect(state().notice).toBeUndefined();
    });

    test('removing the city on Home sends Home back to the current location', async () => {
        const { viewModel, cities, selectedPlace } = setUp();
        await cities.save(ankara);
        viewModel.select({ kind: 'saved', city: ankara });
        await viewModel.remove(ankara);
        expect(selectedPlace.get()).toEqual(CURRENT_LOCATION);
    });

    test('follows the temperature unit setting', async () => {
        const { viewModel, state, settings } = setUp();
        viewModel.start();
        await settings.updateSettings({ temperatureUnit: 'fahrenheit' });
        expect(state().temperatureUnit).toBe('fahrenheit');
    });

    test('after stop, a pending search never runs', async () => {
        const { viewModel, cities } = setUp();
        const stop = viewModel.start();
        viewModel.queryChanged('ank');
        stop();
        await jest.advanceTimersByTimeAsync(1000);
        expect(cities.searches).toEqual([]);
    });
});
