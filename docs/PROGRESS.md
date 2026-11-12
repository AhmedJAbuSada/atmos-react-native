# Progress — hand-over note

> Read this first at the start of every work session (human or AI). Update it at the end.

**Current step:** 07, quality and release ✅ done: **v1.0.0, all seven steps complete**
**Next up:** maintenance only (see below)
**Last updated:** 2026-11-12

## Status

| Step | Status | Branch |
|---|---|---|
| 01 Planning | ✅ Done | `step-01-planning` |
| 02 Project structure | ✅ Done | `step-02-project-structure` |
| 03 Domain layer | ✅ Done | `step-03-domain-layer` |
| 04 Data layer | ✅ Done | `step-04-data-layer` |
| 05 Presentation / UI | ✅ Done | `step-05-presentation-ui` |
| 06 Integration | ✅ Done | `step-06-integration` |
| 07 Quality & release | ✅ Done | `step-07-quality-release` |

## Next up: maintenance
The app is feature-complete for PRD v1.0. Possible next work, each needing a user story first:
- A native-speaker review of the Turkish and Arabic texts (the README says they are AI-written).
- An end-to-end journey on the iOS Simulator (today iOS builds in Release in CI only).
- Passing an `AbortSignal` through `CityRepository.search` so older searches are cancelled, not
  only ignored (step 06 note).
- Release: follow [RELEASE_CHECKLIST.md](process/RELEASE_CHECKLIST.md); the owner creates the
  `v1.0.0` tag and GitHub Release.

## Process rule
After a step is merged into `main`, add the "📍 You are on Step N" section to the top of that
step branch's README, then push the branch.

## Notes for the next session
- Real Open-Meteo responses are in `docs/api/samples/`; tests import them through
  `__tests__/support/samples.ts`.
- Screenshots: put `[screenshots]` in a commit message; CI records them on the emulator and
  commits them to `docs/screenshots/`. Look at them, Arabic first.
- Views take `state` + callbacks; render any of them in a language with
  `__tests__/support/render.tsx`.
- `src/app/main.tsx` is the real entry point; `App` receives its dependencies, so
  `__tests__/App.test.tsx` runs the whole app with fakes.
- Node 22; the Android SDK can be installed to `/opt/android-sdk` in cloud sessions.
