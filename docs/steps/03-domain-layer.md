# Step 03 — Domain layer: the business rules, in plain TypeScript

**Branch:** `step-03-domain-layer` · **Previous:** [step 02](02-project-structure.md) · **Next:** step 04, data layer

The same rules as the [Android](https://github.com/AhmedJAbuSada/atmos-android/blob/step-03-domain-layer/docs/steps/03-domain-layer.md)
and [iOS](https://github.com/AhmedJAbuSada/atmos-ios/blob/step-03-domain-layer/docs/steps/03-domain-layer.md)
domains, written in TypeScript with no React and no React Native. They run in plain Node:
71 tests in about two seconds.

## What this step adds

```
src/domain/
├── common/    result.ts, domainError.ts, dateProvider.ts, valueStore.ts
├── settings/  units.ts, userSettings.ts
├── location/  coordinates.ts (branded), city.ts, repositories.ts, cityUseCases.ts
├── weather/   weatherCondition.ts (WMO table), forecast.ts, getForecast.ts
└── index.ts   the public face of the domain
src/testing/   fakes shared by every layer's tests (no production code may import them)
__tests__/domain/   71 tests; coverage gate 90% on src/domain
```

## Same rules, three languages

| Idea | Kotlin | Swift | TypeScript |
|---|---|---|---|
| Errors as values | `sealed interface AppResult` | `throws(DomainError)` | `{ok: true, value} \| {ok: false, error}` |
| Error cases | `sealed interface DomainError` | `enum DomainError` | union of `{kind: …}` objects |
| Valid coordinates only | `require(...)` in `init` | failable `init?` | **branded type** + `makeCoordinates()` |
| Use case | class with `invoke` | struct with `callAsFunction` | factory returning a function |
| Observable value | `StateFlow` | `ValueStream` actor | `ValueStore` class with `subscribe` |
| Shared fakes | Gradle test fixtures | `AtmosTesting` target | `src/testing` + a lint rule |

## Key ideas

### 1. A branded type makes invalid states impossible
```ts
declare const valid: unique symbol;
export interface Coordinates { readonly latitude: number; readonly longitude: number; readonly [valid]: true }

export function makeCoordinates(latitude: number, longitude: number): Coordinates | undefined
```
`{latitude: 999, longitude: 28}` is not a `Coordinates`: TypeScript rejects it, because only
`makeCoordinates` can produce the hidden brand. The rest of the app can trust every
coordinate it receives.

### 2. Discriminated unions instead of exceptions
`Result<T>` is narrowed by its `ok` flag; `DomainError` by its `kind`. With `assertNever` in the
`default` of a `switch`, adding a new error kind is a compile error in every place that must
handle it.

### 3. Factories instead of classes
```ts
export function makeGetForecast(deps: {repository: WeatherRepository; freshness: ForecastFreshness}) {
  return async (coordinates, forceRefresh = false) => { … };
}
```
Dependencies are arguments; the result is a plain function. In tests you pass fakes, with no
module mocking (`jest.mock`) at all.

### 4. The decision table, again
`makeGetForecast` carries the same cache-first table as the native apps, one test per row,
including "a cancelled download is never hidden behind old data".

### 5. Fakes behind a lint rule
`src/testing` is its own *boundaries* element: tests (outside `src`) may use it, but the
dependency policy gives no layer permission to import it, so fakes can never leak into the app.

## Run it yourself

```bash
git switch step-03-domain-layer
npm install
npm test -- __tests__/domain --coverage
```

## How the AI agent helped in this step

| The agent | The human |
|---|---|
| Ported the domain from Kotlin and Swift to idiomatic TypeScript, tests first | Compared behaviour with the native apps |
| Chose a branded type for coordinates, the TypeScript way to "validate once" | — |
| Ran typecheck, lint and all tests locally before pushing | — |

**What went well, and why:** the domain compiled under `strict` and passed every test on the
first run. Two ports before it (Swift from Kotlin) had settled the rules and the edge cases, so
the third port was mostly translation. **Lesson:** a well-specified domain with tests is
portable; the tests are the specification.

## Checklist: is step 03 done?
- [x] Entities, interfaces and use cases in plain TypeScript
- [x] `Result` errors; cancellation never hidden
- [x] 71 tests, coverage gate 90%, shared fakes protected by lint
- [x] Step guide and `PROGRESS.md` updated
