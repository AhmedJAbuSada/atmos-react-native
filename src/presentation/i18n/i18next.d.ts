import 'i18next';
import type en from './resources/en.json';

/**
 * Types every `t('...')` key against the English resources: a typo such as
 * `t('home.feelLike')` is a compile error, not a raw key on screen (the iOS lesson).
 */
declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'translation';
        resources: { translation: typeof en };
    }
}
