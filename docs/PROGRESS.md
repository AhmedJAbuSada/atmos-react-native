# Progress — hand-over note

> Read this first at the start of every work session (human or AI). Update it at the end.

**Current step:** 04, data layer ✅ done
**Next up:** step 05, presentation / UI (`step-05-presentation-ui`)
**Last updated:** 2026-11-11

## Status

| Step | Status | Branch |
|---|---|---|
| 01 Planning | ✅ Done | `step-01-planning` |
| 02 Project structure | ✅ Done | `step-02-project-structure` |
| 03 Domain layer | ✅ Done | `step-03-domain-layer` |
| 04 Data layer | ✅ Done | `step-04-data-layer` |
| 05 Presentation / UI | ⏳ Next | `step-05-presentation-ui` |
| 06 Integration | ⬜ | — |
| 07 Quality & release | ⬜ | — |

## Next up: step 05 plan
In `src/presentation`, props-only views; no store, no navigation yet (those are step 06).
1. i18next + react-i18next (ADR-0005): `en`, `tr`, `ar` JSON with the same keys; a test that
   every key exists in all three; the language comes from the OS. ADR-0005 does not name a
   library for reading it: **first** decide between `react-native-localize` and the built-in
   `Intl.DateTimeFormat().resolvedOptions().locale` (supersede or extend ADR-0005 if a library is
   added; ask before adding it).
2. Formatting with `Intl`: temperature, wind, time and day names in the **place's** time zone;
   Arabic with Latin digits (`ar-u-nu-latn`); formatted values wrapped in Unicode isolates
   (U+2068 … U+2069) so `11°` never becomes `°11` in Arabic (the Android lesson).
3. Theme: light and dark tokens, `useColorScheme` + the user's `theme` setting.
4. RTL: `start`/`end` styles only; `I18nManager.allowRTL(true)` (ADR-0005), so the OS language
   sets the direction.
5. Views taking `state` + callbacks: Home (current, hourly, daily, sunrise/sunset, stale banner,
   errors), Cities (search, saved list, swipe to remove), Settings, plus loading/empty/error
   states; tests with React Native Testing Library in en, tr and ar.

## Process rule
After a step is merged into `main`, add the "📍 You are on Step N" section to the top of that
step branch's README, then push the branch.

## Notes for the next session
- Real Open-Meteo responses are in `docs/api/samples/`; tests import them through
  `__tests__/support/samples.ts`.
- The iOS location text in `Info.plist` is English only: translate it in step 07.
- Node 22; the Android SDK can be installed to `/opt/android-sdk` in cloud sessions.
