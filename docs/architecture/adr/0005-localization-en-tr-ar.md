# ADR-0005: Localization — i18next, `Intl`, RTL, language from the OS

- **Status:** Accepted
- **Date:** 2026-11-11

## Decision
1. Strings in i18next resources (`en`, `tr`, `ar`). Plurals use i18next's `Intl.PluralRules`
   support, so Arabic gets all six forms.
2. Numbers, units and dates through `Intl` (available in Hermes): Turkish `%69` and `6,9`;
   Arabic with Latin digits through the `ar-u-nu-latn` locale.
3. Every formatted value is wrapped in Unicode **directional isolates** (`U+2066 … U+2069`),
   the fix the Android screenshots found for `11°` showing as `°11` in Arabic.
4. RTL: `I18nManager.allowRTL(true)`; layouts use `start`/`end`, never `left`/`right`.
5. **The language comes from the OS** (Android 13+ and iOS per-app language settings, plus
   the device language). The Settings screen opens the system settings with
   `Linking.openSettings()`. One source of truth, the lesson from the Android version.
6. `toUpperCase()`/`toLowerCase()` are forbidden by a lint rule; use
   `toLocaleUpperCase(locale)`.

## Consequences
- ✅ Same behaviour as the native apps; switching RTL needs no app restart logic of our own.
- ⚠️ Translations need a native-speaker review before release.
