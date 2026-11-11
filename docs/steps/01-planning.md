# Step 01 — Planning: documents before code (React Native)

**Branch:** `step-01-planning` · **Next:** [step 02, project structure](02-project-structure.md)

No code yet, on purpose. This is the third codebase for the same product
([Android](https://github.com/AhmedJAbuSada/atmos-android),
[iOS](https://github.com/AhmedJAbuSada/atmos-ios)), so this step shows how a team adds a
**cross-platform** app to a product that already exists natively.

## Shared vs platform-specific

| Shared (same product, same requirement IDs) | Written for React Native |
|---|---|
| [PRD](../product/PRD.md), [user stories](../product/USER_STORIES.md), [wireframes](../design/WIREFRAMES.md) | [Architecture](../architecture/ARCHITECTURE.md): layers as folders, enforced by ESLint |
| [API contract](../api/API_CONTRACT.md) and recorded [samples](../api/samples/) | [Nine ADRs](../architecture/adr/), each compared with the native apps |
| [Git workflow](../process/GIT_WORKFLOW.md), [Definition of Done](../process/DEFINITION_OF_DONE.md) | [Coding standards](../process/CODING_STANDARDS.md), [AGENTS.md](../../AGENTS.md) |

## One concept, four tools

| Concept | Android | iOS | React Native |
|---|---|---|---|
| Enforce the layers | Gradle modules | Swift package targets | ESLint boundaries |
| View model | `ViewModel` + `StateFlow` | `@Observable` class | Zustand store |
| Dependency injection | Hilt | `AppContainer` | composition root + React Context |
| Errors as values | `AppResult` | typed throws | `Result` union |
| Storage | Room, DataStore | JSON files, UserDefaults | AsyncStorage |
| Translations | `strings.xml` | String Catalog | i18next |
| End-to-end test | Compose UI test on an emulator | XCUITest on the Simulator | Maestro on an emulator |

The architecture is the same in all four; only the tools change. That is the main lesson of
this repository.

## The trade-off of a cross-platform app

| ✅ Gains | ⚠️ Costs |
|---|---|
| One TypeScript codebase for Android and iOS | Two native projects to keep up to date (bare CLI) |
| Web-style tooling: Jest, ESLint, fast refresh | Layer boundaries are lint rules, not compiler rules |
| The domain runs in plain Node | Platform differences still exist (permissions, back button, fonts) |

## How the AI agent helped in this step

| The agent | The human |
|---|---|
| Copied the product docs and adapted the platform facts | Chose the bare CLI over Expo |
| Looked up the current versions of the stack before choosing it | Approved the stack |
| Wrote nine ADRs comparing every choice with the native apps | — |

Prompts: [docs/ai/prompts/step-01-planning.md](../ai/prompts/step-01-planning.md).

## Checklist: is step 01 done?
- [x] Shared product documents, platform facts adapted
- [x] Architecture and nine ADRs
- [x] Coding standards, Definition of Done, templates, `AGENTS.md`
- [x] `PROGRESS.md` updated
