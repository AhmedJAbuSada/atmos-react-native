# ADR-0011: Reading the OS language — react-native-localize

- **Status:** Accepted (extends ADR-0005, which decided *that* the OS owns the language, not *how* to read it)
- **Date:** 2026-11-11

## Context
ADR-0005 makes the operating system the only source of truth for the app language (per-app
language on Android 13+ and iOS, then the device language). React Native has no built-in API that
returns the **app's** preferred languages on both platforms, and none that opens the system page
where the user changes them.

## Decision
Use **[`react-native-localize`](https://github.com/zoontek/react-native-localize)**:
- `findBestLanguageTag(['en', 'tr', 'ar'])` picks the app language from the OS list, with the
  RTL flag; anything else falls back to English (`pickLanguage` in `src/presentation/i18n`).
- `openAppLanguageSettings()` opens the system page for the app language from Settings.
- The app declares its languages to the OS: `CFBundleLocalizations` on iOS and
  `res/xml/locales_config.xml` on Android, so they appear in the system language page.

Approved by the project owner before it was added (AGENTS.md: no dependency without approval).

## Alternatives considered
| Option | Why not |
|---|---|
| `Intl.DateTimeFormat().resolvedOptions().locale` | No extra dependency, but whether Hermes follows the per-app language on each platform is not guaranteed, and it cannot open the system page. |
| `NativeModules.SettingsManager` / `I18nManager` | Platform-specific, undocumented for this purpose, iOS only. |
| An in-app language picker | Two sources of truth, the bug ADR-0005 avoids (the Android lesson). |

## Consequences
- ✅ The same behaviour as the native apps: change the language in the system, the app follows.
- ✅ The lookup is injected into `pickLanguage`, so tests need no native module.
- ⚠️ One more native dependency; Jest uses the library's own mock (`jest.setup.js`).
