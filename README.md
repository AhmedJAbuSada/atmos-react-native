# Atmos — React Native

**A weather app for Android and iOS from one TypeScript codebase, built step by step as a
public tutorial on professional React Native development with Clean Architecture and an AI
coding agent.**

<!-- step-banner:start -->
## 📍 You are on Step 03 of 7 — Domain layer: the business rules, in plain code

`step-03-domain-layer` · [← Step 02](https://github.com/AhmedJAbuSada/atmos-react-native/tree/step-02-project-structure) · [Step 04 →](https://github.com/AhmedJAbuSada/atmos-react-native/tree/step-04-data-layer) · [All steps](docs/ROADMAP.md)

**What this step is.** The business rules in plain TypeScript: a `Result` union for errors, a small `ValueStore` observable, branded `Coordinates` that cannot hold impossible values, units, cities and places, the WMO code table, the forecast entities, the cache-first `makeGetForecast` with its decision table, and 71 Jest tests that run in plain Node in about two seconds.

**Why it matters.** The same rules as the Android and iOS domains, in idiomatic TypeScript. Comparing the three shows what is architecture (identical) and what is language (sealed classes vs typed throws vs discriminated unions; Gradle fixtures vs a Swift target vs a lint-protected folder for the fakes).

**What you will find in this branch**

| Where | What |
|---|---|
| `src/domain/common/` | Result, DomainError, DateProvider, ValueStore |
| `src/domain/weather/getForecast.ts` | Cache-first logic as a decision table |
| `src/domain/location/` | Branded coordinates, cities, city use cases |
| `src/testing/` | Fakes shared by every layer's tests |
| `__tests__/domain/` | 71 tests; coverage gate 90% |

**How to study this step**

1. **Read the full guide:** [docs/steps/03-domain-layer.md](docs/steps/03-domain-layer.md): key ideas, diagrams, and *how the AI agent helped* (including what went wrong).
2. **See exactly what this step changed:** [compare with step 02](https://github.com/AhmedJAbuSada/atmos-react-native/compare/step-02-project-structure...step-03-domain-layer).
3. **Run it:**
   ```bash
   npm test -- __tests__/domain --coverage
   ```
4. **Try the exercise:** Try to create a `Coordinates` object with an object literal. What does TypeScript say, and why is that useful?

> This README shows the project *as it was at this step*. The finished app is on
> [`main`](https://github.com/AhmedJAbuSada/atmos-react-native).

---
<!-- step-banner:end -->

![React Native](https://img.shields.io/badge/React%20Native-0.88-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Clean Architecture](https://img.shields.io/badge/Clean%20Architecture-3%20layers-success)
![Languages](https://img.shields.io/badge/i18n-EN%20%7C%20TR%20%7C%20AR%20(RTL)-blue)
![License](https://img.shields.io/badge/license-MIT-green)

> 🚧 **In progress:** steps 01–03 of 7 are done. Follow along in [PROGRESS.md](docs/PROGRESS.md).

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
| 03 | [`step-03-domain-layer`](../../tree/step-03-domain-layer) | Entities, use cases, `Result` errors |
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
