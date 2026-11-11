# Atmos — React Native

**A weather app for Android and iOS from one TypeScript codebase, built step by step as a
public tutorial on professional React Native development with Clean Architecture and an AI
coding agent.**

<!-- step-banner:start -->
## 📍 You are on Step 02 of 7 — Project structure: the architecture as a compile-time rule

`step-02-project-structure` · [← Step 01](https://github.com/AhmedJAbuSada/atmos-react-native/tree/step-01-planning) · [Step 03 →](https://github.com/AhmedJAbuSada/atmos-react-native/tree/step-03-domain-layer) · [All steps](docs/ROADMAP.md)

**What this step is.** The bare React Native 0.88 project (TypeScript, New Architecture) with the native `android/` and `ios/` folders in the open, the code moved into four layer folders (`src/domain`, `src/data`, `src/presentation`, `src/app`), strict TypeScript, ESLint rules that enforce the dependency direction and the Turkish casing rule, Jest, and CI that runs the checks, an Android build and an iOS build.

**Why it matters.** TypeScript lets any file import any other, so the architecture is enforced by ESLint (`eslint-plugin-boundaries`) and fails CI like a compile error. React Native is a package, not a layer, so a second rule keeps it out of the domain: know what each tool guarantees, and cover the gaps.

**What you will find in this branch**

| Where | What |
|---|---|
| `.eslintrc.js` | The dependency rule + the casing rule |
| `src/domain, src/data, src/presentation, src/app` | The four folders |
| `src/app/composition.ts` | The composition root |
| `tsconfig.json` | strict + noUncheckedIndexedAccess |
| `.github/workflows/ci.yml` | Checks, Android build, iOS build |

**How to study this step**

1. **Read the full guide:** [docs/steps/02-project-structure.md](docs/steps/02-project-structure.md): key ideas, diagrams, and *how the AI agent helped* (including what went wrong).
2. **See exactly what this step changed:** [compare with step 01](https://github.com/AhmedJAbuSada/atmos-react-native/compare/step-01-planning...step-02-project-structure).
3. **Run it:**
   ```bash
   npm install
   npm run typecheck && npm run lint && npm test
   npm run android
   ```
4. **Try the exercise:** Add `import {Platform} from 'react-native'` to a file in `src/domain` and run `npm run lint`. Then call `'abc'.toUpperCase()` anywhere in `src`.

> This README shows the project *as it was at this step*. The finished app is on
> [`main`](https://github.com/AhmedJAbuSada/atmos-react-native).

---
<!-- step-banner:end -->

![React Native](https://img.shields.io/badge/React%20Native-0.88-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Clean Architecture](https://img.shields.io/badge/Clean%20Architecture-3%20layers-success)
![Languages](https://img.shields.io/badge/i18n-EN%20%7C%20TR%20%7C%20AR%20(RTL)-blue)
![License](https://img.shields.io/badge/license-MIT-green)

> 🚧 **In progress:** steps 01–02 of 7 are done. Follow along in [PROGRESS.md](docs/PROGRESS.md).

## The same app on four platforms

| Platform | Repository | Status |
|---|---|---|
| Android (Kotlin, Compose) | [atmos-android](https://github.com/AhmedJAbuSada/atmos-android) | ✅ v1.0.0 |
| iOS (Swift, SwiftUI) | [atmos-ios](https://github.com/AhmedJAbuSada/atmos-ios) | ✅ v1.0.0 |
| **React Native** (TypeScript) | you are here | 🚧 |
| Flutter (Dart) | [atmos-flutter](https://github.com/AhmedJAbuSada/atmos-flutter) | ⬜ |

## The seven steps

| Step | Branch | What you learn |
|---|---|---|
| 01 | [`step-01-planning`](../../tree/step-01-planning) | Shared product docs, React Native architecture, ADRs, AI agent rules |
| 02 | [`step-02-project-structure`](../../tree/step-02-project-structure) | Bare React Native, TypeScript strict, ESLint boundaries, Jest, CI |
| 03 | `step-03-domain-layer` | Entities, use cases, `Result` errors |
| 04 | `step-04-data-layer` | fetch + DTOs, mappers, AsyncStorage, location |
| 05 | `step-05-presentation-ui` | Screens as props-only views, theme, i18next, RTL |
| 06 | `step-06-integration` | Zustand view models, navigation, permissions |
| 07 | `step-07-quality-release` | Maestro end-to-end, screenshots, release |

Full details: [ROADMAP.md](docs/ROADMAP.md).

## Features (v1.0)
Current weather at your location · 24 hours and 7 days · city search with names in your
language · saved cities · offline with the last data · °C/°F and wind units · dark mode ·
**English, Türkçe, العربية** (right to left). Weather data by
[Open-Meteo.com](https://open-meteo.com/); no API key needed.

> **Note on translations:** the Turkish and Arabic texts are written with an AI agent and have
> not yet been reviewed by a native speaker.

## 🤖 Built with an AI agent
[AI_WORKFLOW.md](docs/AI_WORKFLOW.md) · [AGENTS.md](AGENTS.md) ·
[docs/ai/prompts/](docs/ai/prompts/) · every step guide ends with *how the AI agent helped*.

## Author
**Ahmed J. AbuSada**, senior mobile and front-end developer ·
[@AhmedJAbuSada](https://github.com/AhmedJAbuSada)

## License
[MIT](LICENSE). Weather data © Open-Meteo.com, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
