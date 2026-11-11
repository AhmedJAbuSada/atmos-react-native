/** The languages Atmos ships (PRD, NF-02). English is the fallback for every other language. */
export const SUPPORTED_LANGUAGES = ['en', 'tr', 'ar'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Arabic is the only right-to-left language the app ships. */
export function isRightToLeft(language: AppLanguage): boolean {
    return language === 'ar';
}

/**
 * The locale for numbers and dates. Arabic uses **Latin digits** by product decision
 * (ADR-0005): without `-u-nu-latn`, `Intl` writes 15 as ١٥.
 */
export function formattingLocale(language: AppLanguage): string {
    return language === 'ar' ? 'ar-u-nu-latn' : language;
}

/**
 * Picks the app language from the operating system (ADR-0005: one source of truth). The
 * caller passes the OS lookup (`react-native-localize`'s `findBestLanguageTag`), so this
 * stays testable and the presentation layer never stores a language of its own.
 */
export function pickLanguage(
    findBest: (
        tags: readonly AppLanguage[],
    ) => { languageTag: AppLanguage } | undefined,
): AppLanguage {
    return findBest(SUPPORTED_LANGUAGES)?.languageTag ?? 'en';
}

/** i18next stores the language as a plain string; anything unexpected is English. */
export function asAppLanguage(tag: string | undefined): AppLanguage {
    return SUPPORTED_LANGUAGES.find(language => language === tag) ?? 'en';
}
