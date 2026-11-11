# Step 02 — Project structure: make the architecture a rule (React Native)

**Branch:** `step-02-project-structure` · **Previous:** [step 01](01-planning.md) · **Next:** [step 03, domain layer](03-domain-layer.md)

The bare React Native project, with the three layers in place and **tools that enforce them**
before any feature exists.

## What this step adds

```
atmos-react-native/
├── android/, ios/            ← the native projects (bare React Native CLI, ADR-0003)
├── index.js                  ← registers src/app/App
├── src/
│   ├── domain/               ← plain TypeScript only
│   ├── data/                 ← may import domain
│   ├── presentation/         ← may import domain; HelloScreen for now
│   └── app/                  ← App.tsx + composition.ts (the composition root)
├── .eslintrc.js              ← the dependency rule + the casing rule
├── tsconfig.json             ← strict, noUncheckedIndexedAccess
├── __tests__/                ← Jest
├── scripts/annotate-log.py   ← turns build logs into CI annotations
└── .github/workflows/ci.yml  ← checks, Android build, iOS build
```

## Key ideas

### 1. A lint rule as the architecture's guard
TypeScript lets any file import any other file. So the rule lives in ESLint
([`eslint-plugin-boundaries`](https://github.com/javierbrea/eslint-plugin-boundaries)), which
knows the layers by folder. Real output when the rules are broken on purpose:

```
src/domain/leak.ts
  1:26  error  There is no policy allowing dependencies from elements of type "domain" to elements of type "data"   boundaries/dependencies
  2:1   error  'react-native' import is restricted from being used by a pattern. src/domain imports nothing from React or React Native   no-restricted-imports
  4:48  error  Pass a locale: toLocaleUpperCase(locale) / toLocaleLowerCase(locale). See ADR-0005   no-restricted-syntax
src/presentation/leak.ts
  1:26  error  There is no policy allowing dependencies from elements of type "presentation" to elements of type "data"   boundaries/dependencies
```

CI runs ESLint with `--max-warnings 0`, so these fail the build like compile errors would.

### 2. Close every gap
`boundaries` knows our folders, not npm packages. `react-native` is a package, so a second
rule (`no-restricted-imports`, only for `src/domain`) keeps it out. Same lesson as the iOS
repo, where Swift packages could not stop `import SwiftUI`: **know what each tool
guarantees, and cover the gaps.**

### 3. Strict TypeScript
`strict` plus `noUncheckedIndexedAccess`: `array[3]` has type `T | undefined`, so the
"parallel arrays of different lengths" case from the API contract cannot be forgotten.

### 4. The bare CLI, in the open
`android/` and `ios/` are real native projects in the repository: the Gradle build, the
Xcode project, `MainActivity.kt`, `AppDelegate.swift`. Expo would hide them; this tutorial shows
them (ADR-0003). The cost: upgrading React Native means updating them with the
[Upgrade Helper](https://react-native-community.github.io/upgrade-helper/).

### 5. CI on three machines

| Job | Runs on | Proves |
|---|---|---|
| Typecheck, lint and tests | Linux | Types, architecture, casing, Jest |
| Android build | Linux | `./gradlew assembleDebug` |
| iOS build | macOS | `pod install` + `xcodebuild` for the Simulator |

The native builds only run after the fast checks pass. Every failing step reports its error as
an annotation (the script came from the iOS repo, where it was born).

## Run it yourself

```bash
git switch step-02-project-structure
npm install
npm run typecheck && npm run lint && npm test
npm run android        # or: cd ios && pod install && cd .. && npm run ios
```

## How the AI agent helped in this step

| The agent | The human |
|---|---|
| Generated the bare project with the official CLI and moved the app into `src/app` | Reviewed the folder layout |
| Checked that the boundaries plugin supports the template's ESLint 8 before adding it | — |
| Broke all three rules on purpose and captured the errors | — |
| Reused the iOS repo's CI annotation script from day one | — |

**What went wrong, and what we learned:** while adding the tutorial banner to `main`, the agent
ran its README script with the iOS settings on this repository, which inserted links to the
iOS repo. It noticed before committing and removed it with the script's own markers.
**Lesson:** a script that writes to many repositories needs the repository as an explicit
input, and its output needs a look before it is committed.

## Checklist: is step 02 done?
- [x] Bare React Native 0.88 project, TypeScript strict
- [x] Four folders; illegal imports and locale-less casing fail lint (proved)
- [x] Jest runs; composition root in place
- [x] CI: checks, Android build, iOS build
- [x] Step guide and `PROGRESS.md` updated
