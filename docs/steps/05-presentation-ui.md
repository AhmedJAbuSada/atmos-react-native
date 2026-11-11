# Step 05 — Presentation: the views, before any data (React Native)

**Branch:** `step-05-presentation-ui` · **Previous:** [step 04](04-data-layer.md) · **Next:** step 06, integration

Every screen is built as a **view of a state value**: props in, callbacks out. No store, no
repository, no navigation. A view that can only show what it is given can be built, tested and
reviewed on its own, in every language and theme. The same step exists for
[Android](https://github.com/AhmedJAbuSada/atmos-android/blob/step-05-presentation-ui/docs/steps/05-presentation-ui.md)
and [iOS](https://github.com/AhmedJAbuSada/atmos-ios/blob/step-05-presentation-ui/docs/steps/05-presentation-ui.md).

## What this step adds

```
src/presentation/
├── i18n/
│   ├── resources/en.json, tr.json, ar.json ← 77 texts; plurals as _one, _few, _many, …
│   ├── i18n.ts             ← createI18n(language): synchronous i18next instance
│   ├── i18next.d.ts        ← every t('…') key is type-checked against English
│   ├── language.ts         ← supported languages, RTL, Latin digits, pickLanguage()
│   └── useLocalization.ts  ← t, language, rtl; a formatter for the place's time zone
├── formatting/weatherFormatter.ts ← Intl numbers, units, hours, days + directional isolates
├── theme/                  ← light and dark tokens, resolveTheme(), ThemeProvider
├── components/             ← Screen (top bar), Button, IconButton, MessageView, SegmentedControl
├── weather/conditionUi.ts  ← condition → emoji + typed i18n key; moon at night
├── errorMessage.ts         ← DomainError → i18n key; cancelled → nothing
├── home/      homeState.ts, HomeView.tsx
├── cities/    citiesState.ts, CitiesView.tsx
├── settings/  SettingsView.tsx, AboutView.tsx
├── AppProviders.tsx        ← i18n + theme around any view (app and tests)
└── index.ts                ← the layer's public surface

__tests__/presentation/  ← 58 tests: every screen state, in en, tr and ar
.eslintrc.js             ← new rule: no left/right styles
android/…/locales_config.xml, ios/…/Info.plist ← the app's languages, declared to the OS
docs/architecture/adr/0011-react-native-localize.md
```

## Same ideas, three platforms

| Concern | Android | iOS | React Native |
|---|---|---|---|
| Stateless screen | `HomeScreen(state, onEvent)` | `HomeContent(state, actions)` | `<HomeView state actions />` |
| Strings | `strings.xml` × 3 | String Catalog | i18next JSON × 3, keys typed by TypeScript |
| Plurals | `<plurals>` | catalog variations | `_one`, `_two`, `_few` … via `Intl.PluralRules` |
| Numbers, dates | `NumberFormat`, `DateTimeFormatter` | `FormatStyle` | `Intl.NumberFormat`, `Intl.DateTimeFormat` |
| Arabic digits | `-u-nu-latn` | `@numbers=latn` | `ar-u-nu-latn` |
| Theme | Material 3 colour scheme | semantic SwiftUI styles | tokens in `theme.ts` + React Context |
| RTL check | Android Lint `RtlHardcoded` | SwiftUI `leading`/`trailing` | our ESLint rule (below) |
| View tests | Compose UI tests | previews + XCUITest | React Native Testing Library |

## Key ideas

### 1. State in, callbacks out
```tsx
export type HomeState =
    | { kind: 'loading' }
    | { kind: 'needsLocation' }
    | { kind: 'failed'; error: DomainError }
    | { kind: 'content'; content: HomeContent };

<HomeView state={state} actions={{ onRefresh, onRetry, onRequestLocation, onOpenCities, onOpenSettings }} />
```
The view decides nothing; the view model in step 06 will. Because the state is a union, the
`switch` in `HomeBody` must handle every case, and a new case is a compile error until it does.

### 2. The OS owns the language
`pickLanguage(findBestLanguageTag)` asks the system which of `en`, `tr`, `ar` the user prefers
for this app; anything else is English. Settings has no language picker, only a button to the
system page (`openAppLanguageSettings`). The app declares its languages to the OS
(`CFBundleLocalizations`, `locales_config.xml`) so that page lists them. One source of truth:
the lesson from the Android app (ADR-0005, ADR-0011).

### 3. Typed translation keys
`i18next.d.ts` types `t()` against `en.json`, so `t('home.feelLike')` does not compile. The iOS
app once showed a raw key on screen (`condition.overcast`, caught in its screenshots); here
that is a type error. A test
also checks that Turkish and Arabic have exactly the English keys and the same `{{placeholders}}`.

### 4. Arabic plurals for free
```ts
t('home.updatedHours', { count: 2 })  // "تم التحديث قبل ساعتين"   (two)
t('home.updatedHours', { count: 3 })  // "تم التحديث قبل 3 ساعات"  (few)
t('home.updatedHours', { count: 11 }) // "تم التحديث قبل 11 ساعة"  (many)
```
English needs two forms; Arabic needs six. i18next picks the form with `Intl.PluralRules`, so the
code is the same for every language.

### 5. Formatting: the language changes more than the words
| | English | Turkish | Arabic |
|---|---|---|---|
| Humidity | `69%` | `%69` | `69%` |
| Wind (m/s) | `6.9 m/s` | `6,9 m/s` | `6.9 m/s` |
| Sunrise | `7:46 AM` | `07:46` | `7:46 ص` |

Every formatted value is wrapped in **directional isolates** (U+2066 … U+2069), so an Arabic
sentence cannot turn `11°` into `°11`: the bug the Android screenshots found. Times are shown at
the **place** (`timeZone` from the forecast), so Istanbul's sunrise is right on a phone in London.

### 6. A lint rule for right-to-left
```js
// .eslintrc.js
selector: 'Property[key.name=/^(left|right|(margin|padding)(Left|Right)|…)$/]'
message:  'Use start/end … so the layout mirrors in right-to-left languages.'
```
`marginLeft: 4` stays on the left in Arabic; `marginStart: 4` follows the reading direction.
Android has a lint check for this, and React Native has none, so we wrote one in four lines.
**Rules a machine can check should not need a code-review comment.**

### 7. Accessible by construction (NF-03)
- Every button has a role and a label; icon-only buttons say what they do ("Cities", "المدن").
- Touch targets are at least 48 × 48 (the larger of Android 48 dp and Apple 44 pt).
- Settings choices are radio buttons, so screen readers say "°C, selected".
- Each hour and day is read as one sentence: "Now, 15°, Partly cloudy".
- A test checks every text colour against WCAG AA (4.5 : 1) in light and dark.
- No fixed text heights: text grows with the system font size.

### 8. Tests read like the user
```tsx
await renderView(<HomeView state={content()} actions={spy} />, { language: 'ar' });
await fireEvent.press(screen.getByLabelText('المدن'));
expect(spy.onOpenCities).toHaveBeenCalledTimes(1);
```
`renderView` wraps any view in `AppProviders` with a language. Queries use what the user sees or
hears (text, labels, roles), not component names. The forecast is the **recorded** Istanbul
response, mapped by the real mapper from step 04.

### 9. Decisions you might question
- **Emoji, not an icon font.** Colour glyphs on both platforms, no dependency, never mirrored. A
  real product would likely use a designed icon set.
- **A remove button, not a swipe.** Swiping needs a gesture library, and a visible button works
  with every screen reader. The behaviour (remove, then Undo) is what US-05 asks for.

## Run it yourself

```bash
git switch step-05-presentation-ui
npm install
npm test -- __tests__/presentation    # 58 tests in en, tr and ar
npm run android                       # shows Home in the phone's language
```
To see Arabic, set the app language to Arabic in the system settings (Android 13+:
*Settings → Apps → Atmos → Language*; iOS: *Settings → Atmos → Language*) and restart the app.

## How the AI agent helped in this step

| The agent | The human |
|---|---|
| Ported the views and states from the iOS app and reused its AI-written translations | Chose `react-native-localize` for the OS language (ADR-0011) |
| Generated the three i18next files from the iOS String Catalog with a script | — |
| Wrote a test for every screen state, in all three languages | — |
| Read each new library's type definitions before use (RNTL 14 made `render` async) | — |

**What went wrong, and what we learned:**
1. **Turkish times without the leading zero.** `hour: 'numeric'` wrote sunrise as `7:46` in
   Turkish; Turkish uses `07:46`. A Home view test caught it. `timeStyle: 'short'` uses each
   language's own format, as iOS does. **Lesson:** test formatted text in every language, not
   only in English.
2. **Wrong requirement IDs.** The first draft cited NF-06 for contrast; NF-06 is privacy, and
   contrast is NF-03. Small, but a tutorial that cites requirements must cite the right ones.
   **Lesson:** look IDs up, do not recall them.
3. **A test that was hard to read.** The first "same placeholders" test tried to handle Arabic
   plural forms in one expression. It passed, but nobody could follow it. It is now two tests
   with one rule each. **Lesson:** a test is documentation; if it needs explaining, rewrite it.
4. **Key collisions.** iOS has both `settings.theme` and `settings.theme.dark`; nested JSON cannot.
   The script moved the parent text to `settings.theme.title`.
5. **Translations are AI-written** and not reviewed by a native speaker; the new React Native
   strings (the language footer, "Change language", "Back") are too.

## Checklist: is step 05 done?
- [x] Home, Cities, Settings and About as props-only views, every state tested
- [x] Strings in en, tr and ar, with typed keys and a completeness test
- [x] Intl formatting with Latin digits for Arabic and directional isolates
- [x] Light and dark themes, contrast tested; RTL enforced by lint
- [x] The OS language is the only source of truth (ADR-0011)
- [x] Step guide and `PROGRESS.md` updated
