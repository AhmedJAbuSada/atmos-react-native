# Atmos — React Native

**A weather app for Android and iOS from one TypeScript codebase, built step by step as a
public tutorial on professional React Native development with Clean Architecture and an AI
coding agent.**

<!-- step-banner:start -->
> ### 📍 You are on `main`: the newest version
> This branch has every step merged so far (see [PROGRESS.md](docs/PROGRESS.md)); at
> step 07 it becomes the finished app. To **learn how it is built**, start at
> [**Step 01 — Planning: documents before code**](https://github.com/AhmedJAbuSada/atmos-react-native/tree/step-01-planning) and follow the steps in order:
> each step branch has its own README that explains what that step is, why it exists,
> and what changed. All steps: [ROADMAP.md](docs/ROADMAP.md).
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
