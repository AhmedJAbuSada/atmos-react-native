import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { DEFAULT_SETTINGS } from '../../src/domain';
import {
    AboutView,
    type AboutActions,
} from '../../src/presentation/settings/AboutView';
import {
    SettingsView,
    type SettingsActions,
} from '../../src/presentation/settings/SettingsView';
import { renderView } from '../support/render';

const settingsActions = (): jest.Mocked<SettingsActions> => ({
    onChange: jest.fn(),
    onOpenLanguageSettings: jest.fn(),
    onOpenAbout: jest.fn(),
    onBack: jest.fn(),
});

describe('SettingsView (US-08)', () => {
    test('marks the current choices as selected for screen readers', async () => {
        await renderView(
            <SettingsView
                settings={{
                    ...DEFAULT_SETTINGS,
                    windSpeedUnit: 'metersPerSecond',
                }}
                actions={settingsActions()}
            />,
        );
        expect(screen.getByRole('radio', { name: '°C' })).toBeSelected();
        expect(screen.getByRole('radio', { name: '°F' })).not.toBeSelected();
        expect(screen.getByRole('radio', { name: 'm/s' })).toBeSelected();
        expect(screen.getByRole('radio', { name: 'System' })).toBeSelected();
    });

    test('each choice reports only what changed', async () => {
        const spy = settingsActions();
        await renderView(
            <SettingsView settings={DEFAULT_SETTINGS} actions={spy} />,
            { language: 'tr' },
        );
        await fireEvent.press(screen.getByRole('radio', { name: '°F' }));
        await fireEvent.press(screen.getByRole('radio', { name: 'mph' }));
        await fireEvent.press(screen.getByRole('radio', { name: 'Koyu' }));
        expect(spy.onChange.mock.calls).toEqual([
            [{ temperatureUnit: 'fahrenheit' }],
            [{ windSpeedUnit: 'milesPerHour' }],
            [{ theme: 'dark' }],
        ]);
    });

    test('the language is changed in the system settings, not in the app (ADR-0005)', async () => {
        const spy = settingsActions();
        await renderView(
            <SettingsView settings={DEFAULT_SETTINGS} actions={spy} />,
            { language: 'ar' },
        );
        expect(
            screen.getByText('لغة التطبيق تتبع إعدادات هاتفك.'),
        ).toBeOnTheScreen();
        await fireEvent.press(screen.getByText('تغيير اللغة'));
        await fireEvent.press(screen.getByText('حول التطبيق'));
        expect(spy.onOpenLanguageSettings).toHaveBeenCalledTimes(1);
        expect(spy.onOpenAbout).toHaveBeenCalledTimes(1);
    });
});

describe('AboutView (US-10)', () => {
    test('shows the version, the attribution and the licence; links report', async () => {
        const spy: jest.Mocked<AboutActions> = {
            onOpenDataSource: jest.fn(),
            onOpenSourceCode: jest.fn(),
            onBack: jest.fn(),
        };
        await renderView(<AboutView version="1.0.0" actions={spy} />, {
            language: 'tr',
        });
        expect(screen.getByText('Sürüm 1.0.0')).toBeOnTheScreen();
        expect(screen.getByText('Lisans: MIT')).toBeOnTheScreen();
        await fireEvent.press(
            screen.getByText('Hava durumu verileri: Open-Meteo.com ↗'),
        );
        await fireEvent.press(screen.getByText("GitHub'da kaynak kodu ↗"));
        expect(spy.onOpenDataSource).toHaveBeenCalledTimes(1);
        expect(spy.onOpenSourceCode).toHaveBeenCalledTimes(1);
    });
});
