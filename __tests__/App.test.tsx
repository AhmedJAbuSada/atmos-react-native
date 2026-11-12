/**
 * Journey tests: the real App, the real composition root and the real view models, with fake
 * repositories and a fake platform. They use the app the way a person does: by reading text
 * and pressing labelled buttons.
 */
import {
    fireEvent,
    render,
    screen,
    within,
} from '@testing-library/react-native';
import React from 'react';
import App from '../src/app/App';
import {
    createAppDependencies,
    LINKS,
    type AppPlatform,
} from '../src/app/composition';
import { DomainErrors, success } from '../src/domain';
import type { AppLanguage, PermissionAnswer } from '../src/presentation';
import {
    city,
    FakeCityRepository,
    FakeLocationRepository,
    FakeSettingsRepository,
    FakeWeatherRepository,
    fixedDates,
} from '../src/testing';
import { iso } from './support/render';

const ankara = city(323786, 'Ankara');

async function openApp({
    language = 'en' as AppLanguage,
    location = new FakeLocationRepository(),
    permission = 'granted' as PermissionAnswer,
} = {}) {
    const platform: jest.Mocked<AppPlatform> = {
        dates: fixedDates(),
        languageCode: jest.fn(() => language),
        requestLocationPermission: jest.fn(async () => permission),
        openAppSettings: jest.fn(),
        openLanguageSettings: jest.fn(),
        openUrl: jest.fn(),
    };
    const cities = new FakeCityRepository(success([ankara]));
    const dependencies = createAppDependencies(
        {
            weatherRepository: new FakeWeatherRepository(),
            cityRepository: cities,
            settingsRepository: new FakeSettingsRepository(),
            locationRepository: location,
        },
        platform,
        { version: '1.0.0', debounceMs: 0 },
    );
    await render(<App dependencies={dependencies} language={language} />);
    return { platform, cities };
}

test('opens on the forecast for the current location (US-01)', async () => {
    await openApp();
    expect(await screen.findByText('Current location')).toBeOnTheScreen();
    expect(
        within(screen.getByTestId('home.current')).getByText(iso('15°')),
    ).toBeOnTheScreen();
});

test('search a city, add it, pick it: Home shows its forecast (US-04, US-05)', async () => {
    const { cities } = await openApp({ language: 'tr' });
    await fireEvent.press(await screen.findByLabelText('Şehirler'));
    await fireEvent.changeText(
        await screen.findByLabelText('Şehir ara'),
        'ank',
    );
    await fireEvent.press(await screen.findByLabelText('Ankara ekle'));
    expect(cities.searches).toEqual([{ query: 'ank', languageCode: 'tr' }]);

    // The row reads out the last known weather too: "Ankara, 15°, Kapalı".
    await fireEvent.press(await screen.findByLabelText(/^Ankara, /));
    expect(await screen.findByText('Ankara')).toBeOnTheScreen(); // the Home title
    expect(screen.getByTestId('home.current')).toBeOnTheScreen();
});

test('°F in Settings changes Home without a download (US-08)', async () => {
    await openApp();
    await fireEvent.press(await screen.findByLabelText('Settings'));
    await fireEvent.press(await screen.findByRole('radio', { name: '°F' }));
    await fireEvent.press(screen.getByLabelText('Back'));
    expect(
        await within(await screen.findByTestId('home.current')).findByText(
            iso('59°'),
        ),
    ).toBeOnTheScreen();
});

test('Settings opens the system language page; About opens the links', async () => {
    const { platform } = await openApp();
    await fireEvent.press(await screen.findByLabelText('Settings'));
    await fireEvent.press(await screen.findByText('Change language'));
    await fireEvent.press(screen.getByText('About'));
    await fireEvent.press(await screen.findByText('Source code on GitHub ↗'));
    expect(platform.openLanguageSettings).toHaveBeenCalledTimes(1);
    expect(platform.openUrl).toHaveBeenCalledWith(LINKS.sourceCode);
    expect(screen.getByText('Version 1.0.0')).toBeOnTheScreen();
});

test('no location access: explain, ask, then show the forecast (US-01, F-02)', async () => {
    const location = new FakeLocationRepository();
    location.fail(DomainErrors.locationPermissionDenied);
    const { platform } = await openApp({ location });
    expect(await screen.findByText('Where are you?')).toBeOnTheScreen();

    location.result = success(ankara.coordinates); // the user allows it in the system dialog
    await fireEvent.press(screen.getByText('Allow location'));
    expect(platform.requestLocationPermission).toHaveBeenCalledTimes(1);
    expect(await screen.findByTestId('home.current')).toBeOnTheScreen();
});

test('no location access and "search for a city" instead (F-02)', async () => {
    const location = new FakeLocationRepository();
    location.fail(DomainErrors.locationPermissionDenied);
    await openApp({ location, language: 'ar' });
    await fireEvent.press(await screen.findByText('البحث عن مدينة'));
    expect(await screen.findByLabelText('ابحث عن مدينة')).toBeOnTheScreen(); // the search field
});
