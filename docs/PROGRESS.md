# Progress — hand-over note

> Read this first at the start of every work session (human or AI). Update it at the end.

**Current step:** 02, project structure ✅ done
**Next up:** step 03, domain layer (`step-03-domain-layer`)
**Last updated:** 2026-11-11

## Status

| Step | Status | Branch |
|---|---|---|
| 01 Planning | ✅ Done | `step-01-planning` |
| 02 Project structure | ✅ Done | `step-02-project-structure` |
| 03 Domain layer | ⏳ Next | `step-03-domain-layer` |
| 04 Data layer | ⬜ | — |
| 05 Presentation / UI | ⬜ | — |
| 06 Integration | ⬜ | — |
| 07 Quality & release | ⬜ | — |

## Next up: step 03 plan
Port the domain from the Android/iOS repos to TypeScript in `src/domain`, tests first:
`Result` + `DomainError` (with `cancelled`), `DateProvider`, a tiny observable `ValueStore`,
units, settings, coordinates (factory returning `undefined` for impossible values), cities,
places, WMO mapping as a table, forecast entities, `ForecastFreshness`, `makeGetForecast`
(the decision table), search/save/remove/observe use cases, current-location forecast.
Shared fakes in `src/testing/` (ignored by the boundaries rule for production code). Jest
coverage threshold 90% on `src/domain`.

## Process rule
After a step is merged into `main`, add the "📍 You are on Step N" section to the top of that
step branch's README, then push the branch.

## Notes for the next session
- Real Open-Meteo responses are in `docs/api/samples/`.
- Node 22; the Android SDK can be installed to `/opt/android-sdk` in cloud sessions.
