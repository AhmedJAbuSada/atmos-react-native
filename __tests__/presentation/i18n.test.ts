import { createI18n, resources } from '../../src/presentation/i18n/i18n';
import {
    formattingLocale,
    isRightToLeft,
    pickLanguage,
} from '../../src/presentation/i18n/language';

type Tree = { readonly [key: string]: string | Tree };

/** "home.updatedHours_few" → "home.updatedHours": languages have different plural forms. */
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

function flatten(tree: Tree, prefix = ''): Map<string, string> {
    const entries = new Map<string, string>();
    for (const [key, value] of Object.entries(tree)) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'string') {
            entries.set(path, value);
        } else {
            flatten(value, path).forEach((v, k) => entries.set(k, v));
        }
    }
    return entries;
}

const placeholders = (text: string) =>
    [...text.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]).sort();

const keysOf = (language: keyof typeof resources) =>
    new Set(
        [...flatten(resources[language].translation).keys()].map(k =>
            k.replace(PLURAL_SUFFIX, ''),
        ),
    );

describe('translations (AGENTS.md: every string in en, tr and ar)', () => {
    test.each(['tr', 'ar'] as const)(
        '%s has exactly the English keys',
        language => {
            expect([...keysOf(language)].sort()).toEqual(
                [...keysOf('en')].sort(),
            );
        },
    );

    test.each(['tr', 'ar'] as const)(
        '%s uses the same named placeholders as English in every string',
        language => {
            const english = flatten(resources.en.translation);
            const named = (text: string) =>
                placeholders(text).filter(n => n !== 'count');
            flatten(resources[language].translation).forEach((text, key) => {
                const base = key.replace(PLURAL_SUFFIX, '');
                const reference =
                    english.get(key) ?? english.get(`${base}_other`) ?? '';
                expect({ key, names: named(text) }).toEqual({
                    key,
                    names: named(reference),
                });
            });
        },
    );

    test('every "few", "many" and "other" plural form shows the number', () => {
        // "zero", "one" and "two" may spell it out instead: Arabic says "ساعتين", not "2 ساعة".
        (['en', 'tr', 'ar'] as const).forEach(language =>
            flatten(resources[language].translation).forEach((text, key) => {
                if (/_(few|many|other)$/.test(key)) {
                    expect({ language, key, text }).toEqual({
                        language,
                        key,
                        text: expect.stringContaining('{{count}}'),
                    });
                }
            }),
        );
    });

    test('no string is empty', () => {
        (['en', 'tr', 'ar'] as const).forEach(language =>
            flatten(resources[language].translation).forEach((text, key) =>
                expect({ language, key, empty: text.trim() === '' }).toEqual({
                    language,
                    key,
                    empty: false,
                }),
            ),
        );
    });
});

describe('createI18n', () => {
    test('interpolates values', () => {
        expect(createI18n('tr').t('home.feelsLike', { value: '11°' })).toBe(
            'Hissedilen 11°',
        );
    });

    test('Arabic gets its six plural forms from Intl.PluralRules', () => {
        const { t } = createI18n('ar');
        expect(t('home.updatedHours', { count: 1 })).toBe(
            'تم التحديث قبل ساعة',
        );
        expect(t('home.updatedHours', { count: 2 })).toBe(
            'تم التحديث قبل ساعتين',
        );
        expect(t('home.updatedHours', { count: 3 })).toBe(
            'تم التحديث قبل 3 ساعات',
        );
        expect(t('home.updatedHours', { count: 11 })).toBe(
            'تم التحديث قبل 11 ساعة',
        );
    });

    test('English has one and other', () => {
        const { t } = createI18n('en');
        expect(t('home.updatedMinutes', { count: 1 })).toBe(
            'Updated 1 minute ago',
        );
        expect(t('home.updatedMinutes', { count: 5 })).toBe(
            'Updated 5 minutes ago',
        );
    });
});

describe('language', () => {
    test('follows the OS when it offers a supported language', () => {
        expect(pickLanguage(() => ({ languageTag: 'tr' }))).toBe('tr');
    });

    test('given an unsupported OS language, then falls back to English', () => {
        expect(pickLanguage(() => undefined)).toBe('en');
    });

    test('Arabic is right to left and formats with Latin digits', () => {
        expect(isRightToLeft('ar')).toBe(true);
        expect(isRightToLeft('tr')).toBe(false);
        expect(formattingLocale('ar')).toBe('ar-u-nu-latn');
        expect(new Intl.NumberFormat(formattingLocale('ar')).format(15)).toBe(
            '15',
        );
    });
});
