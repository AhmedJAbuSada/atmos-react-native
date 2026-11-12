# Step 06 — Integration: the app works end to end (React Native)

**Branch:** `step-06-integration` · **Previous:** [step 05](05-presentation-ui.md) · **Next:** [step 07, quality and release](07-quality-release.md)

Steps 03 to 05 built three layers that did not know each other: the rules, the data, the views.
This step connects them: **view models** turn use-case results into the states the views
already understand, **containers** connect a view model to its view, and the **composition
root** builds the whole object graph once. After this step the app works end to end. The same
step exists for
[Android](https://github.com/AhmedJAbuSada/atmos-android/blob/step-06-integration/docs/steps/06-integration.md)
and [iOS](https://github.com/AhmedJAbuSada/atmos-ios/blob/step-06-integration/docs/steps/06-integration.md).

## What this step adds

```
src/presentation/viewModels/
├── selectedPlace.ts       ← which place Home shows; Cities writes it (a domain ValueStore)
├── homeViewModel.ts       ← loading → content / needsLocation / failed; refresh; permission
├── citiesViewModel.ts     ← debounced search, add, remove with Undo, last known weather
└── settingsViewModel.ts   ← observe and change the settings
src/presentation/{home,cities,settings}/*Screen.tsx ← containers: store → view
src/app/
├── composition.ts         ← createAppDependencies(data, platform): the whole graph, no native code
├── main.tsx               ← the real entry: OS language, native data module, native platform
├── platform.ts            ← permission dialog, settings pages, links (native glue)
├── DependenciesContext.tsx← hands the graph to the screens (ADR-0004)
├── navigation.tsx         ← RootStackParamList + the four routes (ADR-0008)
└── App.tsx                ← providers, theme from the settings, NavigationContainer
__tests__/presentation/viewModels/ ← 27 tests: success, failure, late answers, stop
__tests__/App.test.tsx            ← 6 journeys through the real app with fakes
```

## Same ideas, three platforms

| Concern | Android | iOS | React Native |
|---|---|---|---|
| View model | `ViewModel` + `StateFlow` | `@Observable` class | Zustand **vanilla** store + functions |
| Screen ↔ view model | route composable | `.task { await run() }` | container with `useStore` + `useEffect(start)` |
| Stop work when leaving | `viewModelScope` | task cancellation | `start()` returns `stop()`; late answers ignored |
| Debounce | `debounce(300)` on a Flow | `Task.sleep` + cancel | `setTimeout` + a generation number |
| Wiring | Hilt | `AppContainer` | `createAppDependencies` + React Context |
| Navigation | Navigation Compose | `NavigationStack` | React Navigation native stack, typed routes |
| Journey test | Compose UI test | XCUITest | Testing Library over the real `<App>` with fakes |

## Key ideas

### 1. A view model is a store and a few functions
```ts
const home = createHomeViewModel({ getCurrentLocationForecast, getForecast, freshness, selectedPlace,
                                   settings, requestLocationPermission, openAppSettings });
home.store.getState();   // a HomeState from step 05
const stop = home.start(); // follow the selected place and the settings
await home.refresh();
```
Zustand's `createStore` (from `zustand/vanilla`) has no React in it, so a view model is tested
as a plain object: call a function, read the state. The React part is one line in the
container: `const state = useStore(viewModel.store)`.

### 2. Presentation logic only
The Home view model decides **which state to show**: loading, the forecast, "where are you?",
an error. *Whether* to download (fresh cache, offline fallback) is the `makeGetForecast` decision
table from step 03, so the view model is short. Every layer does one job.

### 3. Late answers are ignored
JavaScript cannot cancel a promise. Each load and each search takes a number; when the answer
arrives, it is used only if its number is still the latest:
```ts
const token = ++generation;
const result = await deps.getForecast(coordinates);
if (token !== generation) return; // the user picked another city meanwhile
```
`stop()` also moves the number on, so nothing changes a screen that is gone. Tests resolve a
promise **after** the user moved on and check that the screen did not change, and removing the
guard makes them fail (we checked).

### 4. Debounce, Undo and timers in tests
Search waits 300 ms after the last keystroke; "Ankara removed · Undo" stays 5 seconds. Both are
`setTimeout`, so the tests use Jest's fake timers:
```ts
viewModel.queryChanged('ank');
await jest.advanceTimersByTimeAsync(299); expect(cities.searches).toEqual([]);
await jest.advanceTimersByTimeAsync(1);   expect(cities.searches).toHaveLength(1);
```

### 5. Asking for location: explain first, then the system dialog
The data layer only **checks** the permission (step 04). The view model shows `needsLocation`
with an explanation and two ways forward. "Allow location" shows the system dialog; if the user
says yes, the forecast loads; if the system will not ask again (`blocked`), the app opens its
settings page instead of doing nothing. "Search for a city" is always there (F-02).

### 6. One composition root, two entry points
`createAppDependencies(data, platform)` wires repositories → use cases → view models and touches
no native code. `main.tsx` calls it with AsyncStorage, Open-Meteo and the GPS; the journey test
calls it with fakes. **The wiring the test checks is the wiring the app runs.**

### 7. Typed routes, shared state
```ts
export type RootStackParamList = { Home: undefined; Cities: undefined; Settings: undefined; About: undefined };
```
`navigate('Citys')` does not compile. No route has parameters: the selected place is shared
state (`selectedPlace`), so going back to Home always shows what Cities picked, even after a
city on screen is removed.

### 8. Journey tests through the real app
```tsx
await fireEvent.press(await screen.findByLabelText('Şehirler'));
await fireEvent.changeText(await screen.findByLabelText('Şehir ara'), 'ank');
await fireEvent.press(await screen.findByLabelText('Ankara ekle'));
```
Six journeys run the real `App`, navigation and view models in Node, in Turkish, Arabic and
English: search and pick a city, °F in Settings, the system language page and About links,
the permission flow, and "search instead".

## Run it yourself

```bash
git switch step-06-integration
npm install
npm test                        # 226 tests, including the journeys
npm run android                 # the real app: location, search, settings
cd ios && pod install && cd .. && npm run ios
```

## How the AI agent helped in this step

| The agent | The human |
|---|---|
| Ported the view models from the iOS app to Zustand stores | Decided the libraries in step 01 (ADR-0003, ADR-0008) |
| Wrote tests for late answers and checked them by removing the guard | — |
| Read the installed libraries' docs and types instead of trusting memory | — |

**What went wrong, and what we learned:**
1. **Tests that did not test their name.** The first "older search is ignored" test used a fake
   that answered at once, so nothing was ever late; it passed with or without the guard. It now
   uses a promise the test resolves later, and we removed the guard to see it fail.
   **Lesson:** a test you have never seen fail proves nothing.
2. **The real app was loaded in tests.** `App.tsx` first created the real dependencies, so Jest
   loaded AsyncStorage and the GPS library, and failed on their native code. Instead of mocking
   more libraries, the real wiring moved to `main.tsx`, and `App` receives its dependencies.
   **Lesson:** when a test needs many mocks, the design is telling you something.
3. **Memory is not documentation.** Two things recalled from memory were out of date:
   `openAppLanguageSettings('application')` (it takes no argument; the type check caught it), and
   the old Android advice for react-native-screens (`onCreate(null)`); this version asks for a
   `RNScreensFragmentFactory` in `MainActivity`, and that is what we did.
4. **A plan item we changed.** The step plan said older searches are *aborted*. The domain's
   `search()` takes no `AbortSignal`, so older answers are **ignored** instead. The request
   still finishes, but nothing it returns reaches the screen. Adding a signal through the domain
   is a possible improvement.
5. **A test that matched too exactly.** "Ankara" was not found because, after Home loaded, the
   row reads out its cached weather too ("Ankara, 15°, Kapalı"). The app was right; the test now
   matches the start of the label.

## Checklist: is step 06 done?
- [x] A view model per screen, tested with fakes: success, failure, cancellation, late answers
- [x] Containers connect view models to the views from step 05
- [x] One composition root; the real wiring in `main.tsx`
- [x] Typed navigation between Home, Cities, Settings and About
- [x] Location permission: explanation first, system dialog, settings when blocked
- [x] Journey tests through the real app in three languages
- [x] Step guide and `PROGRESS.md` updated
