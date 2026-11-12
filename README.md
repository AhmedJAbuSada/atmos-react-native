# Atmos — React Native

**A weather app for Android and iOS from one TypeScript codebase, built step by step as a
public tutorial on professional React Native development with Clean Architecture and an AI
coding agent.**

<!-- step-banner:start -->
## 📍 You are on Step 07 of 7 — Quality & release: prove it works the way users get it

`step-07-quality-release` · [← Step 06](https://github.com/AhmedJAbuSada/atmos-react-native/tree/step-06-integration) · [All steps](docs/ROADMAP.md)

**What this step is.** Proof that the built app works, and everything needed to ship it: the R8-shrunk release APK runs the main journey (search, add and open a city, change the unit) on an Android emulator against the real API, in English, Turkish and Arabic, with Maestro and testIDs; CI records 15 screenshots that were reviewed by eye; the iOS app builds in Release with its permission text translated and a correct privacy manifest; version 1.0.0, a changelog and a release checklist.

**Why it matters.** Hundreds of fast tests in Node cannot prove the native build, R8, the real network, the OS language setting or right-to-left on a real screen. One slow journey can. A failing device test describes the screen in the CI annotation, so every failure is understood in one run.

**What you will find in this branch**

| Where | What |
|---|---|
| `e2e/journey.yaml` | The Maestro journey, by testID |
| `scripts/device-tests.sh` | Runs it in en, tr and ar |
| `.github/workflows/ci.yml` | Release APK → emulator → screenshots |
| `docs/screenshots/` | Recorded by CI |
| `docs/process/RELEASE_CHECKLIST.md` | How to ship, without keys in the repo |

**How to study this step**

1. **Read the full guide:** [docs/steps/07-quality-release.md](docs/steps/07-quality-release.md): key ideas, diagrams, and *how the AI agent helped* (including what went wrong).
2. **See exactly what this step changed:** [compare with step 06](https://github.com/AhmedJAbuSada/atmos-react-native/compare/step-06-integration...step-07-quality-release).
3. **Run it:**
   ```bash
   npm test
   cd android && ./gradlew assembleRelease && cd ..
   ./scripts/device-tests.sh   # with an emulator running and Maestro installed
   ```
4. **Try the exercise:** Add a second Maestro flow for removing a city with Undo. Which testIDs does it need, and do they all exist?

> This README shows the project *as it was at this step*. The finished app is on
> [`main`](https://github.com/AhmedJAbuSada/atmos-react-native).

---
<!-- step-banner:end -->

![React Native](https://img.shields.io/badge/React%20Native-0.88-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Clean Architecture](https://img.shields.io/badge/Clean%20Architecture-3%20layers-success)
![Languages](https://img.shields.io/badge/i18n-EN%20%7C%20TR%20%7C%20AR%20(RTL)-blue)
![License](https://img.shields.io/badge/license-MIT-green)

> ✅ **v1.0.0:** all seven steps are done. 226 tests in Node, plus the main journey on an
> Android emulator in English, Turkish and Arabic on every push.

## Screenshots
The release build on an Android emulator, recorded by CI ([step 07](docs/steps/07-quality-release.md)).

| English | Türkçe | العربية (right to left) |
|---|---|---|
| <img src="docs/screenshots/android-en/4-city.png" width="240" alt="Home with the forecast for Ankara, in English"> | <img src="docs/screenshots/android-tr/4-city.png" width="240" alt="Home with the forecast for Ankara, in Turkish"> | <img src="docs/screenshots/android-ar/4-city.png" width="240" alt="Home with the forecast for Ankara, in Arabic, right to left"> |
| <img src="docs/screenshots/android-en/2-search.png" width="240" alt="City search in English"> | <img src="docs/screenshots/android-tr/2-search.png" width="240" alt="City search in Turkish"> | <img src="docs/screenshots/android-ar/2-search.png" width="240" alt="City search in Arabic"> |
| <img src="docs/screenshots/android-en/5-settings.png" width="240" alt="Settings in English"> | <img src="docs/screenshots/android-tr/5-settings.png" width="240" alt="Settings in Turkish"> | <img src="docs/screenshots/android-ar/5-settings.png" width="240" alt="Settings in Arabic"> |

## Run it
Node 22, and the Android SDK and/or Xcode with CocoaPods, as in the
[React Native environment setup](https://reactnative.dev/docs/set-up-your-environment).
```bash
npm install
npm test                         # typecheck: npm run typecheck · lint: npm run lint
npm run android                  # or: cd ios && pod install && cd .. && npm run ios
```
No API key is needed. To see Arabic or Turkish, change the app's language in the phone's
settings.

## How it is built
```
src/domain        pure TypeScript: entities, use cases, Result errors (no React)
src/data          fetch + DTOs, mappers, AsyncStorage, location → domain interfaces
src/presentation  props-only views, Zustand view models, i18next, theme
src/app           composition root, navigation, the real entry point (main.tsx)
```
ESLint enforces the arrows ([ADR-0001](docs/architecture/adr/0001-clean-architecture-with-eslint-boundaries.md)).
Full picture: [ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md).

## The same app on four platforms

| Platform | Repository | Status |
|---|---|---|
| Android (Kotlin, Compose) | [atmos-android](https://github.com/AhmedJAbuSada/atmos-android) | ✅ v1.0.0 |
| iOS (Swift, SwiftUI) | [atmos-ios](https://github.com/AhmedJAbuSada/atmos-ios) | ✅ v1.0.0 |
| **React Native** (TypeScript) | you are here | ✅ v1.0.0 |
| Flutter (Dart) | [atmos-flutter](https://github.com/AhmedJAbuSada/atmos-flutter) | 🚧 |

## The seven steps

| Step | Branch | What you learn |
|---|---|---|
| 01 | [`step-01-planning`](../../tree/step-01-planning) | Shared product docs, React Native architecture, ADRs, AI agent rules |
| 02 | [`step-02-project-structure`](../../tree/step-02-project-structure) | Bare React Native, TypeScript strict, ESLint boundaries, Jest, CI |
| 03 | [`step-03-domain-layer`](../../tree/step-03-domain-layer) | Entities, use cases, `Result` errors |
| 04 | [`step-04-data-layer`](../../tree/step-04-data-layer) | fetch + DTOs, mappers, AsyncStorage, location |
| 05 | [`step-05-presentation-ui`](../../tree/step-05-presentation-ui) | Screens as props-only views, theme, i18next, RTL |
| 06 | [`step-06-integration`](../../tree/step-06-integration) | Zustand view models, navigation, permissions |
| 07 | [`step-07-quality-release`](../../tree/step-07-quality-release) | Maestro end-to-end, screenshots, release |

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
