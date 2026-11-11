/**
 * Renders a view the way the app does, in any language and theme, so one test file checks
 * English, Turkish and Arabic.
 */
import { render } from '@testing-library/react-native';
import React from 'react';
import { mapForecast } from '../../src/data/mappers/forecastMapper';
import type { ForecastDto } from '../../src/data/remote/dtos';
import { DEFAULT_SETTINGS, type Forecast } from '../../src/domain';
import { AppProviders } from '../../src/presentation/AppProviders';
import type { AppLanguage } from '../../src/presentation/i18n/language';
import { lightTheme, type Theme } from '../../src/presentation/theme/theme';
import { ISTANBUL, NOW } from '../../src/testing';
import { sample } from './samples';

export function renderView(
    ui: React.ReactElement,
    {
        language = 'en',
        theme = lightTheme,
    }: { language?: AppLanguage; theme?: Theme } = {},
) {
    return render(
        <AppProviders language={language} theme={theme}>
            {ui}
        </AppProviders>,
    );
}

/** The recorded Istanbul forecast, mapped by the real mapper: 24 hours, 7 days. */
export function recordedForecast(): Forecast {
    return mapForecast(
        JSON.parse(sample('forecast_istanbul.json')) as ForecastDto,
        ISTANBUL,
        NOW,
    );
}

export const SETTINGS = DEFAULT_SETTINGS;

/** Formatted values sit between directional isolates; this builds the text a user sees. */
export const iso = (value: string) => `⁦${value}⁩`;
