# Progress — hand-over note

> Read this first at the start of every work session (human or AI). Update it at the end.

**Current step:** 03, domain layer ✅ done
**Next up:** step 04, data layer (`step-04-data-layer`)
**Last updated:** 2026-11-11

## Status

| Step | Status | Branch |
|---|---|---|
| 01 Planning | ✅ Done | `step-01-planning` |
| 02 Project structure | ✅ Done | `step-02-project-structure` |
| 03 Domain layer | ✅ Done | `step-03-domain-layer` |
| 04 Data layer | ⏳ Next | `step-04-data-layer` |
| 05 Presentation / UI | ⬜ | — |
| 06 Integration | ⬜ | — |
| 07 Quality & release | ⬜ | — |

## Next up: step 04 plan
In `src/data`, implementing the domain interfaces; tests read `docs/api/samples` directly.
1. DTO types (all optional), `HttpClient` interface over `fetch` with timeouts
   (`AbortController`), User-Agent, retry on network errors and 5xx (never 4xx/cancel).
2. Mappers: local API times + IANA zone → epoch ms (no date library: compute the zone offset
   with `Intl.DateTimeFormat`), parallel arrays zipped safely, requested coordinates kept.
3. Error mapping: `TypeError` (network) → noConnection, abort → cancelled/timeout, HTTP →
   server/notFound, bad JSON → unknown.
4. `KeyValueStore` interface (AsyncStorage in the app, in-memory in tests); forecast cache
   (raw response + fetch time), saved cities, settings.
5. Location: `@react-native-community/geolocation` + `react-native-permissions` behind
   `LocationRepository`; checks permission, never requests it.
6. `createDataModule()` returning domain interfaces; wired in `src/app/composition.ts`.

## Process rule
After a step is merged into `main`, add the "📍 You are on Step N" section to the top of that
step branch's README, then push the branch.

## Notes for the next session
- Real Open-Meteo responses are in `docs/api/samples/`.
- Node 22; the Android SDK can be installed to `/opt/android-sdk` in cloud sessions.
