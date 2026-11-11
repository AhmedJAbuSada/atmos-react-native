# Atmos — React Native

**A weather app for Android and iOS from one TypeScript codebase, built step by step as a
public tutorial on professional React Native development with Clean Architecture and an AI
coding agent.**

<!-- step-banner:start -->
## 📍 You are on Step 05 of 7 — Presentation: the views, before any data

`step-05-presentation-ui` · [← Step 04](https://github.com/AhmedJAbuSada/atmos-react-native/tree/step-04-data-layer) · [Step 06 →](https://github.com/AhmedJAbuSada/atmos-react-native/tree/step-06-integration) · [All steps](docs/ROADMAP.md)

**What this step is.** Every screen (Home, Cities, Settings, About) as a props-only view: a `state` value in, callbacks out, no store and no navigation. Strings in English, Turkish and Arabic with typed i18next keys and Arabic's six plural forms; numbers, units and times through `Intl` with Latin digits for Arabic and directional isolates around every value; light and dark design tokens with a contrast test; and a new ESLint rule that forbids `left`/`right` styles so the layout mirrors in Arabic. 58 tests render every state in all three languages.

**Why it matters.** A view that can only show what it is given can be built, reviewed and tested before any data exists, in every language and theme. Localization is designed in, not added later: the OS owns the language (ADR-0011), Turkish writes `%69` and `07:46`, and Arabic reads right to left without turning `11°` into `°11`.

**What you will find in this branch**

| Where | What |
|---|---|
| `src/presentation/home/` | HomeState union + HomeView |
| `src/presentation/i18n/` | en/tr/ar resources, typed keys, OS language |
| `src/presentation/formatting/` | Intl formatter with directional isolates |
| `src/presentation/theme/` | Light/dark tokens, resolveTheme |
| `.eslintrc.js` | The new right-to-left rule |
| `__tests__/presentation/` | 58 tests in en, tr and ar |

**How to study this step**

1. **Read the full guide:** [docs/steps/05-presentation-ui.md](docs/steps/05-presentation-ui.md): key ideas, diagrams, and *how the AI agent helped* (including what went wrong).
2. **See exactly what this step changed:** [compare with step 04](https://github.com/AhmedJAbuSada/atmos-react-native/compare/step-04-data-layer...step-05-presentation-ui).
3. **Run it:**
   ```bash
   npm test -- __tests__/presentation
   npm run android
   ```
4. **Try the exercise:** Add a "Windy" badge to Home when the wind is above 40 km/h. Add the string in all three languages, then write a test that renders it in Arabic.

> This README shows the project *as it was at this step*. The finished app is on
> [`main`](https://github.com/AhmedJAbuSada/atmos-react-native).

---
<!-- step-banner:end -->

![React Native](https://img.shields.io/badge/React%20Native-0.88-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Clean Architecture](https://img.shields.io/badge/Clean%20Architecture-3%20layers-success)
![Languages](https://img.shields.io/badge/i18n-EN%20%7C%20TR%20%7C%20AR%20(RTL)-blue)
![License](https://img.shields.io/badge/license-MIT-green)

> 🚧 **In progress:** steps 01–05 of 7 are done. Follow along in [PROGRESS.md](docs/PROGRESS.md).

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
| 04 | [`step-04-data-layer`](../../tree/step-04-data-layer) | fetch + DTOs, mappers, AsyncStorage, location |
| 05 | [`step-05-presentation-ui`](../../tree/step-05-presentation-ui) | Screens as props-only views, theme, i18next, RTL |
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
