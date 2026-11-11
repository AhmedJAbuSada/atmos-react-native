import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import {
    CURRENT_LOCATION,
    DomainErrors,
    type City,
    type Place,
} from '../../src/domain';
import { CitiesView } from '../../src/presentation/cities/CitiesView';
import type {
    CitiesActions,
    CitiesState,
} from '../../src/presentation/cities/citiesState';
import { city } from '../../src/testing';
import { iso, renderView } from '../support/render';

const istanbul: City = {
    ...city(745044, 'İstanbul'),
    region: 'İstanbul',
    country: 'Türkiye',
};
const ankara: City = city(323786, 'Ankara');
const saved = (c: City): Place => ({ kind: 'saved', city: c });

const actions = (): jest.Mocked<CitiesActions> => ({
    onQueryChange: jest.fn(),
    onRetrySearch: jest.fn(),
    onAdd: jest.fn(),
    onRemove: jest.fn(),
    onSelect: jest.fn(),
    onUndo: jest.fn(),
    onBack: jest.fn(),
});

const state = (change: Partial<CitiesState> = {}): CitiesState => ({
    query: '',
    search: { kind: 'idle' },
    places: [{ place: CURRENT_LOCATION }],
    temperatureUnit: 'celsius',
    ...change,
});

describe('CitiesView', () => {
    test('the current location is first and cannot be removed (US-05)', async () => {
        await renderView(
            <CitiesView
                state={state({
                    places: [
                        {
                            place: CURRENT_LOCATION,
                            temperature: { celsius: 15 },
                            condition: 'overcast',
                        },
                        {
                            place: saved(ankara),
                            temperature: { celsius: 12 },
                            condition: 'rain',
                        },
                    ],
                })}
                actions={actions()}
            />,
        );
        expect(
            screen.getByLabelText(`Current location, ${iso('15°')}, Overcast`),
        ).toBeOnTheScreen();
        expect(
            screen.getByLabelText(`Ankara, ${iso('12°')}, Rain`),
        ).toBeOnTheScreen();
        expect(screen.getByLabelText('Remove Ankara')).toBeOnTheScreen();
        expect(screen.getAllByLabelText(/^Remove /)).toHaveLength(1);
    });

    test('with no saved city, explains how to add one', async () => {
        await renderView(<CitiesView state={state()} actions={actions()} />, {
            language: 'tr',
        });
        expect(
            screen.getByText('Buraya eklemek için bir şehir arayın.'),
        ).toBeOnTheScreen();
    });

    test('typing reports the query, and the clear button empties it', async () => {
        const spy = actions();
        await renderView(
            <CitiesView state={state({ query: 'ist' })} actions={spy} />,
        );
        await fireEvent.changeText(
            screen.getByLabelText('Search city'),
            'ista',
        );
        await fireEvent.press(screen.getByLabelText('Clear search'));
        expect(spy.onQueryChange.mock.calls).toEqual([['ista'], ['']]);
    });

    test('a result shows its region and country, and tapping it adds the city (US-04)', async () => {
        const spy = actions();
        await renderView(
            <CitiesView
                state={state({
                    query: 'ista',
                    search: { kind: 'results', cities: [istanbul] },
                })}
                actions={spy}
            />,
            { language: 'tr' },
        );
        // The region equals the name, so only the country is repeated.
        expect(screen.getByText('Türkiye')).toBeOnTheScreen();
        await fireEvent.press(screen.getByLabelText('İstanbul ekle'));
        expect(spy.onAdd).toHaveBeenCalledWith(istanbul);
    });

    test('no results says so', async () => {
        await renderView(
            <CitiesView
                state={state({ query: 'zzzz', search: { kind: 'noResults' } })}
                actions={actions()}
            />,
        );
        expect(screen.getByText('No cities found')).toBeOnTheScreen();
    });

    test('given a failed search, then offers Try again, in Arabic', async () => {
        const spy = actions();
        await renderView(
            <CitiesView
                state={state({
                    query: 'ist',
                    search: { kind: 'failed', error: DomainErrors.timeout },
                })}
                actions={spy}
            />,
            { language: 'ar' },
        );
        expect(
            screen.getByText('خدمة الطقس تستغرق وقتًا طويلًا للرد.'),
        ).toBeOnTheScreen();
        await fireEvent.press(screen.getByText('إعادة المحاولة'));
        expect(spy.onRetrySearch).toHaveBeenCalledTimes(1);
    });

    test('a removed city can be brought back with Undo (US-05)', async () => {
        const spy = actions();
        await renderView(
            <CitiesView
                state={state({ notice: { kind: 'removed', city: ankara } })}
                actions={spy}
            />,
        );
        expect(screen.getByText('Ankara removed')).toBeOnTheScreen();
        await fireEvent.press(screen.getByText('Undo'));
        expect(spy.onUndo).toHaveBeenCalledTimes(1);
    });

    test('adding a city twice says it is already saved, with no Undo', async () => {
        await renderView(
            <CitiesView
                state={state({
                    notice: { kind: 'alreadySaved', city: ankara },
                })}
                actions={actions()}
            />,
        );
        expect(
            screen.getByText('Ankara is already in your list'),
        ).toBeOnTheScreen();
        expect(screen.queryByText('Undo')).not.toBeOnTheScreen();
    });

    test('tapping a place selects it; remove and back report too', async () => {
        const spy = actions();
        await renderView(
            <CitiesView
                state={state({
                    places: [
                        { place: CURRENT_LOCATION },
                        { place: saved(ankara) },
                    ],
                })}
                actions={spy}
            />,
            { language: 'ar' },
        );
        await fireEvent.press(screen.getByLabelText('Ankara'));
        await fireEvent.press(screen.getByLabelText('إزالة Ankara'));
        await fireEvent.press(screen.getByLabelText('رجوع'));
        expect(spy.onSelect).toHaveBeenCalledWith(saved(ankara));
        expect(spy.onRemove).toHaveBeenCalledWith(ankara);
        expect(spy.onBack).toHaveBeenCalledTimes(1);
    });
});
