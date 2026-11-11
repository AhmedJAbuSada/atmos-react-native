import i18next, { type i18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './resources/ar.json';
import en from './resources/en.json';
import tr from './resources/tr.json';
import type { AppLanguage } from './language';

export const resources = {
    en: { translation: en },
    tr: { translation: tr },
    ar: { translation: ar },
};

/**
 * A ready-to-use i18next instance for `language`. Synchronous (`initAsync: false`): the
 * resources are bundled, so the first frame already has its text, and tests need no `await`.
 * Plurals use `Intl.PluralRules`, so Arabic gets all six forms (zero, one, two, few, many,
 * other) from the same `t('home.updatedHours', {count})` call.
 */
export function createI18n(language: AppLanguage): i18n {
    const instance = i18next.createInstance();
    // init() returns a promise even when synchronous; there is nothing to wait for.
    instance
        .use(initReactI18next)
        .init({
            lng: language,
            fallbackLng: 'en',
            resources,
            initAsync: false,
            // React already escapes text; double escaping would show "&amp;".
            interpolation: { escapeValue: false },
            returnNull: false,
        })
        .catch(() => undefined);
    return instance;
}
