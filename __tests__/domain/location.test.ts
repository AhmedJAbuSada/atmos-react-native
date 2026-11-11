import {
    CURRENT_LOCATION,
    failure,
    makeCoordinates,
    makeObservePlaces,
    makeRemoveCity,
    makeSaveCity,
    makeSearchCities,
    samePlace,
    success,
    DomainErrors,
    type Place,
} from '../../src/domain';
import { city, FakeCityRepository } from '../../src/testing';

describe('Coordinates', () => {
    it('accepts the edges of the valid range', () => {
        expect(makeCoordinates(90, 180)).toBeDefined();
        expect(makeCoordinates(-90, -180)).toBeDefined();
    });

    it.each([
        [999, 28],
        [41, -181],
    ])('refuses impossible values (%p, %p)', (latitude, longitude) => {
        // The API answers 400 for latitude 999 (docs/api/samples/forecast_error.json).
        expect(makeCoordinates(latitude, longitude)).toBeUndefined();
    });
});

/** Acceptance criteria of US-04 that belong to the domain. */
describe('searchCities', () => {
    it.each(['i', '  i  ', ''])(
        'given fewer than 2 characters (%p), then no search is made',
        async query => {
            const repository = new FakeCityRepository();
            expect(await makeSearchCities(repository)(query, 'tr')).toEqual(
                success([]),
            );
            expect(repository.searches).toEqual([]);
        },
    );

    it('given a valid query, then searches the trimmed text in the requested language', async () => {
        const repository = new FakeCityRepository();
        await makeSearchCities(repository)('  ista ', 'tr');
        expect(repository.searches).toEqual([
            { query: 'ista', languageCode: 'tr' },
        ]);
    });

    it('given the network fails, then returns the error', async () => {
        const repository = new FakeCityRepository(
            failure(DomainErrors.noConnection),
        );
        expect(await makeSearchCities(repository)('ista', 'en')).toEqual(
            failure(DomainErrors.noConnection),
        );
    });
});

/** Acceptance criteria of US-05 (favourite cities). */
describe('city use cases', () => {
    const ankara = city(1, 'Ankara');
    const london = city(2, 'London');

    function places(repository: FakeCityRepository): readonly Place[] {
        let latest: readonly Place[] = [];
        makeObservePlaces(repository)(value => (latest = value))();
        return latest;
    }

    it('given no saved cities, then the list holds only the current location', () => {
        expect(places(new FakeCityRepository())).toEqual([CURRENT_LOCATION]);
    });

    it('saved cities follow the current location, in the order they were added', async () => {
        const repository = new FakeCityRepository();
        await makeSaveCity(repository)(ankara);
        await makeSaveCity(repository)(london);
        expect(places(repository)).toEqual([
            CURRENT_LOCATION,
            { kind: 'saved', city: ankara },
            { kind: 'saved', city: london },
        ]);
    });

    it('saving a city twice changes nothing the second time', async () => {
        const repository = new FakeCityRepository();
        const save = makeSaveCity(repository);
        expect(await save(ankara)).toBe('saved');
        expect(await save(ankara)).toBe('alreadySaved');
        expect(await repository.getSavedCities()).toEqual([ankara]);
    });

    it('removing a city, then saving it again (undo), restores it', async () => {
        const repository = new FakeCityRepository();
        await makeSaveCity(repository)(ankara);
        await makeRemoveCity(repository)(ankara.id);
        expect(await repository.getSavedCities()).toEqual([]);
        await makeSaveCity(repository)(ankara);
        expect(await repository.getSavedCities()).toEqual([ankara]);
    });

    it('places compare by identity of the city', () => {
        expect(samePlace(CURRENT_LOCATION, CURRENT_LOCATION)).toBe(true);
        expect(
            samePlace(
                { kind: 'saved', city: ankara },
                { kind: 'saved', city: city(1, 'Renamed') },
            ),
        ).toBe(true);
        expect(
            samePlace({ kind: 'saved', city: ankara }, CURRENT_LOCATION),
        ).toBe(false);
    });
});
