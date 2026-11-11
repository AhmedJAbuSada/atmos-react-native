import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    createWeatherFormatter,
    type WeatherFormatter,
} from '../formatting/weatherFormatter';
import { asAppLanguage, isRightToLeft, type AppLanguage } from './language';

/** The translation function, the current language and its direction. */
export function useLocalization(): {
    t: ReturnType<typeof useTranslation>['t'];
    language: AppLanguage;
    rtl: boolean;
} {
    const { t, i18n } = useTranslation();
    const language = asAppLanguage(i18n.language);
    return { t, language, rtl: isRightToLeft(language) };
}

/** A formatter for the current language and **the place's** time zone. */
export function useFormatter(timeZone: string): WeatherFormatter {
    const { language } = useLocalization();
    return useMemo(
        () => createWeatherFormatter(language, timeZone),
        [language, timeZone],
    );
}
