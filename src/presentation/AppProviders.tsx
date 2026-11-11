import React, { useMemo } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createI18n } from './i18n/i18n';
import type { AppLanguage } from './i18n/language';
import { ThemeProvider } from './theme/ThemeContext';
import type { Theme } from './theme/theme';

/**
 * Everything a screen needs around it: translations for `language` and the theme. The app root
 * uses it with the OS language; tests use it with any language, so the same view is checked
 * in English, Turkish and Arabic.
 */
export function AppProviders({
    language,
    theme,
    children,
}: {
    language: AppLanguage;
    theme: Theme;
    children: React.ReactNode;
}): React.JSX.Element {
    const i18n = useMemo(() => createI18n(language), [language]);
    return (
        <I18nextProvider i18n={i18n}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </I18nextProvider>
    );
}
