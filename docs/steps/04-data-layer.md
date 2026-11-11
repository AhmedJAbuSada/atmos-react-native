# Step 04 — Data layer: the app's backend on the phone (React Native)

**Branch:** `step-04-data-layer` · **Previous:** [step 03](03-domain-layer.md) · **Next:** [step 05, presentation / UI](05-presentation-ui.md)

The data layer talks to the outside world (Open-Meteo, AsyncStorage, the GPS) and
**implements the interfaces the domain declared in step 03**. Nothing outside `src/data` knows
that `fetch`, JSON or AsyncStorage exist: the composition root receives domain interfaces and
nothing else. The same layer exists for
[Android](https://github.com/AhmedJAbuSada/atmos-android/blob/step-04-data-layer/docs/steps/04-data-layer.md)
and [iOS](https://github.com/AhmedJAbuSada/atmos-ios/blob/step-04-data-layer/docs/steps/04-data-layer.md).

## What this step adds

```
src/data/
├── remote/
│   ├── dtos.ts            ← the JSON, field by field, all optional
│   ├── httpClient.ts      ← a one-method interface; fetch client (timeout, cancel); retry decorator
│   ├── openMeteoApi.ts    ← builds the two URLs, parses the JSON
│   └── errorMapping.ts    ← the ONLY place that knows network and HTTP errors
├── mappers/
│   ├── localTime.ts       ← "2026-11-11T10:15" in Europe/Istanbul → an instant, with Intl only
│   ├── forecastMapper.ts  ← DTO → Forecast, zips the parallel arrays safely
│   └── cityMapper.ts      ← DTO → City, drops results that cannot be saved
├── local/
│   ├── keyValueStore.ts   ← the interface (ADR-0007) + an in-memory store for tests
│   ├── asyncStorageStore.ts ← the real store, AsyncStorage v3
│   └── cacheKey.ts        ← "forecast:41.01,28.97", whatever the phone's language
├── repositories/          ← WeatherRepository, CityRepository, SettingsRepository
├── location/
│   ├── locationRepository.ts ← the logic, behind an injected LocationPlatform
│   └── nativeLocation.ts     ← the real platform calls (ADR-0010)
├── dataModule.ts          ← createDataModule(): returns domain interfaces only
└── index.ts               ← the layer's public surface: no DTO, no concrete repository

__tests__/data/      ← 65 tests on the recorded samples; coverage gate 85% on src/data
__tests__/support/   ← replays docs/api/samples through a fake HttpClient
src/app/composition.ts ← creates the real data layer
ios/Podfile, Info.plist, AndroidManifest.xml ← the location permission, coarse only
```

## Same ideas, three platforms

| Concern | Android | iOS | React Native |
|---|---|---|---|
| HTTP | Retrofit + OkHttp | `URLSession` behind `HTTPClient` | `fetch` behind `HttpClient` |
| Timeout / cancel | OkHttp timeouts, coroutine cancel | `URLSession`, task cancel | `AbortController` |
| Retry | OkHttp `Interceptor` | `RetryingHTTPClient` decorator | `withRetry()` decorator |
| Time zones | `java.time` | `TimeZone` + `DateFormatter` | `Intl.DateTimeFormat` (no library) |
| Test server | MockWebServer | fake `HTTPClient` | fake `HttpClient` replaying the samples |
| Cache + cities | Room | JSON files (actor) | AsyncStorage (ADR-0007) |
| Settings | DataStore | `UserDefaults` | AsyncStorage |
| Location | FusedLocationProvider | `CLLocationUpdate` | community Geolocation + permissions (ADR-0010) |
| Wiring | Hilt `@Binds` | `DataModule` | `createDataModule()` |

## Key ideas

### 1. An interface at the edge of the network
```ts
export interface HttpClient {
  get(url: string, signal?: AbortSignal): Promise<{readonly status: number; readonly body: string}>;
}
```
Everything above it (the API, the retry rule, the repositories) is tested with
`replayingClient(...)`, which answers with the **real recorded responses** from
`docs/api/samples`. No mock server, no `jest.mock('fetch')`, no network.

### 2. Timeout and cancellation are two different errors
`fetch` has no timeout, so the client starts an `AbortController` and aborts it after 15 s. A
caller can also pass its own `signal` (the screen went away). Both end in an abort, so the client
remembers **why** it aborted and throws `TimeoutError` or `CancelledError`. The difference
matters: a timeout shows "The server is slow", a cancellation shows nothing (ADR-0006).

### 3. Retry as a decorator
`withRetry(createFetchHttpClient(userAgent))` adds retries without the real client knowing:

| Failure | Retried? |
|---|---|
| Network error (`TypeError` from `fetch`) | ✅ up to 2×, 1 s then 2 s |
| HTTP 5xx | ✅ up to 2× |
| HTTP 4xx | ❌ our request is wrong |
| Cancellation | ❌ the user left; stop now |

The `sleep` function is injected, so the tests check the delays (`[1000, 2000]`) without waiting.

### 4. Time zones without a date library
Open-Meteo sends `"2026-11-11T10:15"`: 10:15 **in Istanbul**, with no offset. JavaScript's
`new Date("2026-11-11T10:15")` would read it in the *phone's* zone, which is wrong for anyone
looking at another city. `parseLocalTime` asks `Intl.DateTimeFormat` for the zone's offset at
that moment, and asks twice so the days the clocks change are right too. Tests check Istanbul
(10:15 → 07:15 UTC) and New York in summer and winter. Hermes, the React Native engine, implements
`Intl` on top of the operating system's time zone data, so the phone gives the same answers as
Node in the tests.

### 5. Errors become values at one place
```ts
async fetchForecast(coordinates) {
  try { … return success(forecast); }
  catch (error) { return failure(toDomainError(error)); }
}
```
`toDomainError` is the single translation table, tested row by row: `TypeError` →
`noConnection`, `TimeoutError` → `timeout`, `CancelledError` → `cancelled`, HTTP 404 →
`notFound`, any other status → `server(code)`, bad JSON → `unknown`.

### 6. The cache stores the response, not our objects
The forecast cache keeps the **raw text** of the response and the fetch time, and maps it on
read. When a mapper bug is fixed, old cached data is mapped correctly too. And an unreadable
cache (an older app version, a half-written value) is "no cache", never a crash.

### 7. The data layer checks the permission; it never asks
`LocationRepository.currentLocation()` calls `check()` and answers
`locationPermissionDenied` if the user has not allowed it. **Asking** is a UI decision: the app
explains why before the system dialog (US-01), so `request()` lives in the presentation layer in
step 06. The platform calls sit behind a `LocationPlatform` interface, so all of this is tested
without a phone.

### 8. Lessons carried over from Android and iOS
- **The empty search has no `results` key.** The DTO makes it optional; a test uses the
  recorded `geocoding_empty.json`.
- **The cache key ignores the phone's language.** `toFixed(2)` always writes a dot, so a Turkish
  phone never stores `41,01`.
- **The requested coordinates are kept**, not the ones the API snapped to its grid; otherwise
  the next cache lookup would miss.
- **Stored settings are sanitized**: a value from an older version (`"kelvin"`) falls back to
  the default instead of breaking the Settings screen.

## Run it yourself

```bash
git switch step-04-data-layer
npm install
npm test -- --coverage        # 136 tests: domain + data, in plain Node
cd ios && pod install         # macOS: the location permission is linked here
```

## How the AI agent helped in this step

| The agent | The human |
|---|---|
| Ported the data layer from the Android and iOS apps to TypeScript | Approved the step plan and the libraries (ADR-0010) |
| Tested everything against the recorded samples before pushing | — |
| Read each library's type definitions before using it (AsyncStorage v3 changed its API) | — |

**What went wrong, and what we learned:**
1. **A wrong helper call passed at runtime.** A test called `city({id, name})`, but the helper
   is `city(id, name)`. Jest (through Babel) does not type-check, so the test ran and failed
   for a confusing reason; `tsc` would have said it at once. **Lesson:** run `npm run
   typecheck` on tests too; it is part of the "done" command in AGENTS.md for this reason.
2. **No Node types, no `fs`.** The first sample loader read files with `fs`, which needs
   `@types/node`, a new dependency. Instead of adding it, the samples are imported as JSON
   modules. **Lesson:** a rule against unapproved dependencies pushes you to the simpler tool.
3. **Generated files were linted.** A local coverage run created `coverage/`, and `eslint .`
   failed on it. It is now in `.eslintignore`: the rule stays strict for code we write.
4. **Not done yet:** the iOS location text in `Info.plist` is English only; it is translated in
   step 07 with the other system texts, as in the iOS app.

## Checklist: is step 04 done?
- [x] Every domain interface has an implementation in `src/data`
- [x] DTOs and mappers tested against every recorded sample
- [x] Error mapping, retry rules, timeout, cancel and the API queries tested
- [x] Forecast cache, saved cities and settings tested, including corrupt data
- [x] Location permission checked, never requested, by the data layer
- [x] The composition root creates the real data layer
- [x] Step guide, ADR-0010 and `PROGRESS.md` updated
