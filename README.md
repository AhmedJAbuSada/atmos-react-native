# Atmos — React Native

**A weather app for Android and iOS from one TypeScript codebase, built step by step as a
public tutorial on professional React Native development with Clean Architecture and an AI
coding agent.**

<!-- step-banner:start -->
## 📍 You are on Step 01 of 7 — Planning: documents before code

`step-01-planning` · [Step 02 →](https://github.com/AhmedJAbuSada/atmos-react-native/tree/step-02-project-structure) · [All steps](docs/ROADMAP.md)

**What this step is.** There is **no code** in this branch, on purpose. This is the third codebase for the same product, so the requirements, user stories, wireframes and API contract are **shared** with the native Android and iOS apps (same IDs), while the architecture, nine ADRs, TypeScript standards and `AGENTS.md` are written **for React Native**, each choice compared with the native apps.

**Why it matters.** It shows how a team adds a cross-platform app to a product that already exists natively: the architecture stays the same and only the tools change (ESLint boundaries instead of Gradle modules or Swift packages, Zustand stores instead of ViewModels, a Result union instead of AppResult or typed throws).

**What you will find in this branch**

| Where | What |
|---|---|
| `docs/product/, docs/design/, docs/api/` | Shared with Android and iOS: the same product |
| `docs/architecture/ARCHITECTURE.md` | Three layers as folders, enforced by ESLint |
| `docs/architecture/adr/` | Nine decisions, each compared with the native apps |
| `docs/process/CODING_STANDARDS.md` | TypeScript strict, ESLint, React Native rules |
| `AGENTS.md, docs/AI_WORKFLOW.md` | How to work with an AI coding agent |

**How to study this step**

1. **Read the full guide:** [docs/steps/01-planning.md](docs/steps/01-planning.md): key ideas, diagrams, and *how the AI agent helped* (including what went wrong).
2. **Read in this order:** PRD → user stories → API contract → architecture → ADRs → AGENTS.md.
3. **Try the exercise:** Pick one ADR and read its counterpart in the Android and iOS repos. Which differences come from the platform, and which from the language?

> This README shows the project *as it was at this step*. The finished app is on
> [`main`](https://github.com/AhmedJAbuSada/atmos-react-native).

---
<!-- step-banner:end -->

![React Native](https://img.shields.io/badge/React%20Native-0.88-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Clean Architecture](https://img.shields.io/badge/Clean%20Architecture-3%20layers-success)
![Languages](https://img.shields.io/badge/i18n-EN%20%7C%20TR%20%7C%20AR%20(RTL)-blue)
![License](https://img.shields.io/badge/license-MIT-green)

> 🚧 **In progress:** step 01 of 7 is done. Follow along in [PROGRESS.md](docs/PROGRESS.md).

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
| 02 | `step-02-project-structure` | Bare React Native, TypeScript strict, ESLint boundaries, Jest, CI |
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
