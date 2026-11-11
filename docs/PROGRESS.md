# Progress — hand-over note

> Read this first at the start of every work session (human or AI). Update it at the end.

**Current step:** 05, presentation / UI ✅ done
**Next up:** step 06, integration (`step-06-integration`)
**Last updated:** 2026-11-11

## Status

| Step | Status | Branch |
|---|---|---|
| 01 Planning | ✅ Done | `step-01-planning` |
| 02 Project structure | ✅ Done | `step-02-project-structure` |
| 03 Domain layer | ✅ Done | `step-03-domain-layer` |
| 04 Data layer | ✅ Done | `step-04-data-layer` |
| 05 Presentation / UI | ✅ Done | `step-05-presentation-ui` |
| 06 Integration | ⏳ Next | `step-06-integration` |
| 07 Quality & release | ⬜ | — |

## Next up: step 06 plan
Connect the views from step 05 to the use cases from step 03 and the data layer from step 04.
Libraries are already decided: Zustand (ADR-0003) and React Navigation native stack (ADR-0008).
1. View models as Zustand **vanilla** stores, one per screen, created by factories with their use
   cases (`createHomeViewModel({getForecast, ...})`), tested as plain objects with the fakes in
   `src/testing`. Each exposes one state value (the `HomeState`, `CitiesState`, … from step 05).
2. Home: load from the selected place (current location first), cache-first through
   `makeGetForecast`, pull to refresh, outdated banner from `refreshError`; cancellation is never
   shown (ADR-0006).
3. Location permission flow: the explanation screen first (`needsLocation`), then
   `react-native-permissions` `request()`; denied → city search (F-02). The data layer only
   checks (step 04).
4. Cities: debounced search (300 ms, min 2 characters, older requests aborted), save,
   remove with Undo, last known temperature per place from the cache.
5. Settings: observe and update through `SettingsRepository`; the theme setting drives
   `resolveTheme`; the language button calls `openAppLanguageSettings()`; About opens links.
6. `src/app`: a React Context with the dependencies (ADR-0004), `RootStackParamList` with Home,
   Cities, Settings, About, and containers that connect each store to its view.
7. Tests: every view model (success, failure, cancellation), plus one journey test that renders
   the app with fakes and goes Home → Cities → add a city → Home.

## Process rule
After a step is merged into `main`, add the "📍 You are on Step N" section to the top of that
step branch's README, then push the branch.

## Notes for the next session
- Real Open-Meteo responses are in `docs/api/samples/`; tests import them through
  `__tests__/support/samples.ts`.
- The iOS location text in `Info.plist` is English only: translate it in step 07.
- Views take `state` + callbacks; render any of them in a language with
  `__tests__/support/render.tsx`.
- Node 22; the Android SDK can be installed to `/opt/android-sdk` in cloud sessions.
