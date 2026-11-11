# Coding standards (TypeScript / React Native)

Rules a machine can check are checked by tools (set up in step 02).

## Tooling

| Tool | Checks | Runs |
|---|---|---|
| **TypeScript** (`strict`, `noUncheckedIndexedAccess`) | Types, nulls, exhaustive `switch` | `npm run typecheck` |
| **ESLint** (+ boundaries, React hooks rules, custom restrictions) | Architecture, hooks, casing, style | `npm run lint` |
| **Prettier** | Formatting | `npm run format` |
| **Jest** | Behaviour | `npm test` |

All run in CI on every pull request, with `--max-warnings 0`.

## Naming

| Thing | Convention | Example |
|---|---|---|
| File | `camelCase.ts`, components `PascalCase.tsx` | `getForecastUseCase.ts`, `HomeScreen.tsx` |
| Use case factory | `makeVerbNoun` | `makeGetForecast` |
| Repository | interface `NounRepository`, implementation `createNounRepository` | `WeatherRepository` |
| DTO | `NounDto` | `ForecastDto` |
| View model | `createScreenViewModel` → store | `createHomeViewModel` |
| Test | `it('given X, when Y, then Z')` | `it('given stale cache, when loading, then downloads')` |

## TypeScript rules
- `readonly` properties and arrays in public types.
- No `any`; no non-null assertion `!` outside tests.
- Discriminated unions with an exhaustive `switch` and a `never` check for states and errors.
- Never `throw` across a layer boundary: return a `Result` (ADR-0006).
- **Never** `toUpperCase()`/`toLowerCase()`: use `toLocaleUpperCase(locale)` (Turkish `i`).
- No magic numbers: `const CACHE_LIFETIME_MS = 30 * 60 * 1000`.

## React Native rules
- Containers connect stores; views take props only and have a test for each state.
- `start`/`end` (`marginStart`, `paddingEnd`), never `left`/`right`.
- Every touchable has `accessibilityRole` and `accessibilityLabel` when it has no text;
  minimum hit area 48 × 48 dp (Android) / 44 × 44 pt (iOS).
- No inline user-facing strings: `t('home.next24Hours')`.
