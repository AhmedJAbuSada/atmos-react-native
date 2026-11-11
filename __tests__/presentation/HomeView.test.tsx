import { fireEvent, screen, within } from '@testing-library/react-native';
import React from 'react';
import { DomainErrors } from '../../src/domain';
import { HomeView } from '../../src/presentation/home/HomeView';
import type {
    HomeActions,
    HomeContent,
    HomeState,
} from '../../src/presentation/home/homeState';
import { iso, recordedForecast, renderView, SETTINGS } from '../support/render';

const actions = (): jest.Mocked<HomeActions> => ({
    onRefresh: jest.fn(),
    onRetry: jest.fn(),
    onRequestLocation: jest.fn(),
    onOpenCities: jest.fn(),
    onOpenSettings: jest.fn(),
});

const content = (change: Partial<HomeContent> = {}): HomeState => ({
    kind: 'content',
    content: {
        forecast: recordedForecast(),
        settings: SETTINGS,
        refreshing: false,
        ...change,
    },
});

describe('HomeView', () => {
    test('loading shows the skeleton, announced as busy', async () => {
        await renderView(
            <HomeView state={{ kind: 'loading' }} actions={actions()} />,
        );
        expect(screen.getByLabelText('Loading the forecast')).toBeOnTheScreen();
    });

    test('without location or a saved city, offers both ways forward (F-02), in Turkish', async () => {
        const spy = actions();
        await renderView(
            <HomeView state={{ kind: 'needsLocation' }} actions={spy} />,
            { language: 'tr' },
        );
        expect(screen.getByText('Neredesiniz?')).toBeOnTheScreen();
        await fireEvent.press(screen.getByText('Konuma izin ver'));
        await fireEvent.press(screen.getByText('Şehir ara'));
        expect(spy.onRequestLocation).toHaveBeenCalledTimes(1);
        expect(spy.onOpenCities).toHaveBeenCalledTimes(1);
    });

    test('given no connection and nothing cached, then shows the message and Try again, in Arabic', async () => {
        const spy = actions();
        await renderView(
            <HomeView
                state={{ kind: 'failed', error: DomainErrors.noConnection }}
                actions={spy}
            />,
            {
                language: 'ar',
            },
        );
        expect(
            screen.getByText(
                'أنت غير متصل بالإنترنت. تحقق من اتصالك وحاول مرة أخرى.',
            ),
        ).toBeOnTheScreen();
        await fireEvent.press(screen.getByText('إعادة المحاولة'));
        expect(spy.onRetry).toHaveBeenCalledTimes(1);
    });

    test('a cancelled load is never shown as an error (ADR-0006)', async () => {
        await renderView(
            <HomeView
                state={{ kind: 'failed', error: DomainErrors.cancelled }}
                actions={actions()}
            />,
        );
        expect(screen.queryByText('Try again')).not.toBeOnTheScreen();
        expect(screen.getByTestId('home.loading')).toBeOnTheScreen();
    });

    test('shows the current conditions of the recorded forecast', async () => {
        await renderView(<HomeView state={content()} actions={actions()} />);
        expect(screen.getByText('Current location')).toBeOnTheScreen();
        const current = within(screen.getByTestId('home.current'));
        expect(current.getByText(iso('15°'))).toBeOnTheScreen();
        expect(current.getByText('Overcast')).toBeOnTheScreen();
        expect(
            current.getByText(
                `Feels like ${iso('11°')} · Humidity ${iso('69%')}`,
            ),
        ).toBeOnTheScreen();
        expect(current.getByText(`Wind ${iso('25 km/h')}`)).toBeOnTheScreen();
        expect(
            screen.getByText('Weather data by Open-Meteo.com'),
        ).toBeOnTheScreen();
    });

    test('shows the city name, sunrise and sunset at the place (US-03)', async () => {
        await renderView(
            <HomeView
                state={content({ placeName: 'İstanbul' })}
                actions={actions()}
            />,
            {
                language: 'tr',
            },
        );
        expect(screen.getByText('İstanbul')).toBeOnTheScreen();
        expect(screen.getByTestId('home.sun')).toHaveTextContent(
            `🌅 Gün doğumu ${iso('07:46')} · Gün batımı ${iso('17:49')}`,
        );
    });

    test('lists 24 hours starting with "Now" and hides a 0% chance of rain (US-02)', async () => {
        await renderView(<HomeView state={content()} actions={actions()} />);
        const hours = within(screen.getByTestId('home.hourly'));
        expect(hours.getByLabelText(/^Now, /)).toBeOnTheScreen();
        expect(hours.getAllByLabelText(/, /)).toHaveLength(24);
        // 10:00 has 0%: no chance in its label. 19:00 has 3%: it is read out.
        expect(
            hours.getByLabelText(`Now, ${iso('15°')}, Partly cloudy`),
        ).toBeOnTheScreen();
        expect(
            hours.getByLabelText(
                new RegExp(`7:00\\sPM.*${iso('3%')} chance of precipitation`),
            ),
        ).toBeOnTheScreen();
    });

    test('lists 7 days, the first one as "Today", with low and high', async () => {
        await renderView(<HomeView state={content()} actions={actions()} />);
        const days = within(screen.getByTestId('home.daily'));
        expect(days.getAllByLabelText(/Low .*, high /)).toHaveLength(7);
        expect(
            days.getByLabelText(
                `Today, Overcast, Low ${iso('11°')}, high ${iso('17°')}`,
            ),
        ).toBeOnTheScreen();
        expect(days.getByLabelText(/^Thursday, /)).toBeOnTheScreen();
    });

    test('temperatures follow the unit setting, without a download (US-08)', async () => {
        await renderView(
            <HomeView
                state={content({
                    settings: { ...SETTINGS, temperatureUnit: 'fahrenheit' },
                })}
                actions={actions()}
            />,
        );
        expect(
            within(screen.getByTestId('home.current')).getByText(iso('59°')),
        ).toBeOnTheScreen();
    });

    test('old data says how old it is (F-08), with the Arabic plural form', async () => {
        await renderView(
            <HomeView
                state={content({ outdatedByMs: 2 * 3_600_000 })}
                actions={actions()}
            />,
            {
                language: 'ar',
            },
        );
        expect(screen.getByTestId('home.outdated')).toHaveTextContent(
            '⚠️ تم التحديث قبل ساعتين',
        );
    });

    test('fresh data shows no warning', async () => {
        await renderView(<HomeView state={content()} actions={actions()} />);
        expect(screen.queryByTestId('home.outdated')).not.toBeOnTheScreen();
    });

    test('the top bar buttons have labels for screen readers (NF-03)', async () => {
        const spy = actions();
        await renderView(<HomeView state={content()} actions={spy} />, {
            language: 'ar',
        });
        await fireEvent.press(screen.getByLabelText('المدن'));
        await fireEvent.press(screen.getByLabelText('الإعدادات'));
        expect(spy.onOpenCities).toHaveBeenCalledTimes(1);
        expect(spy.onOpenSettings).toHaveBeenCalledTimes(1);
    });
});
