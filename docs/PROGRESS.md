# Progress — hand-over note

> Read this first at the start of every work session (human or AI). Update it at the end.

**Current step:** 01, planning ✅ done
**Next up:** step 02, project structure (`step-02-project-structure`)
**Last updated:** 2026-11-11

## Status

| Step | Status | Branch |
|---|---|---|
| 01 Planning | ✅ Done | `step-01-planning` |
| 02 Project structure | ⏳ Next | `step-02-project-structure` |
| 03 Domain layer | ⬜ | — |
| 04 Data layer | ⬜ | — |
| 05 Presentation / UI | ⬜ | — |
| 06 Integration | ⬜ | — |
| 07 Quality & release | ⬜ | — |

## Next up: step 02 plan
1. `npx @react-native-community/cli init` (TypeScript, New Architecture) into the repository
   root; app name `Atmos`, bundle id / application id `dev.ahmedabusada.atmos.rn`.
2. `src/{domain,data,presentation,app}` with the composition root and a "Hello, Atmos" screen.
3. TypeScript strict; ESLint with `eslint-plugin-boundaries` and the casing rule; Prettier;
   Jest. Prove the guards: a `react-native` import in `src/domain` fails lint.
4. CI: typecheck, lint, Jest on Linux; Android debug build; iOS build on macOS.

## Process rule
After a step is merged into `main`, add the "📍 You are on Step N" section to the top of that
step branch's README, then push the branch.

## Notes for the next session
- Real Open-Meteo responses are in `docs/api/samples/`.
- Node 22; the Android SDK can be installed to `/opt/android-sdk` in cloud sessions.
