# Step 07 — Quality and release: proof that it works, on a device (React Native)

**Branch:** `step-07-quality-release` · **Previous:** [step 06](06-integration.md)

Steps 03 to 06 are proven by 226 tests that run in Node in seconds. This step proves the
**built app** works: the release APK, shrunk by R8, runs the main journey on an Android emulator
against the real API, in English, Turkish and Arabic, and CI records screenshots that a person
then looks at. It also gets the app ready to ship: versions, system texts in three languages,
the privacy manifest, and a release checklist. The same step exists for
[Android](https://github.com/AhmedJAbuSada/atmos-android/blob/step-07-quality-release/docs/steps/07-quality-release.md)
and [iOS](https://github.com/AhmedJAbuSada/atmos-ios/blob/step-07-quality-release/docs/steps/07-quality-release.md).

## What this step adds

```
e2e/journey.yaml                 ← the Maestro journey, by testID, the same in every language
scripts/device-tests.sh          ← per language: clear the app, set its language, run, keep screenshots
scripts/describe-screen.py       ← on failure: what was on the screen, as CI annotation text
.github/workflows/ci.yml         ← android: release APK (R8) → device: emulator journey → screenshots
docs/screenshots/android-{en,tr,ar}/ ← recorded by CI with "[screenshots]" in a commit message
ios/Atmos/{en,tr,ar}.lproj/InfoPlist.strings ← the location permission text, translated
ios/Atmos/PrivacyInfo.xcprivacy  ← declares the coarse location sent to Open-Meteo
docs/process/RELEASE_CHECKLIST.md, CHANGELOG.md ← version 1.0.0
```

## The test pyramid, finished

| Level | What | Where | How many | Time |
|---|---|---|---|---|
| Unit | domain, data, view models, formatting, translations, theme | Jest, Node | 195 | seconds |
| Component | every screen state, en/tr/ar | Testing Library, Node | 25 | seconds |
| Journey (fakes) | the real `App`, navigation, wiring | Testing Library, Node | 6 | seconds |
| End to end | the release APK, real API, real phone OS | Maestro, emulator | 1 journey × 3 languages | ~10 min |

Many fast tests, one slow one: the slow one only has to prove what Node cannot (the native
build, R8, the real network, the OS language setting, right-to-left on a real screen).

## Key ideas

### 1. The journey is written by testID, so it is the same in every language
```yaml
- tapOn:
    id: message.secondaryAction      # "Search for a city" / "Şehir ara" / "البحث عن مدينة"
- tapOn:
    id: cities.search
- inputText: Ankara
- tapOn:
    id: cities.add.323786            # Ankara's id from the geocoding service
```
`scripts/device-tests.sh` runs it three times. Before each run it clears the app and sets its
language the way a user would on Android 13+ (`cmd locale set-app-locales … --locales ar`). The
app reads the language from the OS (ADR-0005), so this also tests that.

### 2. The release build is the one tested
The `android` job builds `assembleRelease` with **R8 on**, and the `device` job installs exactly
that APK. R8 removes code it thinks is unused; a library reached only by reflection can break
only in release. Testing the debug build would never see it.

### 3. A failing device test must say why
At first the journey failed with only "id: home.current is not visible". The CI logs need a
login, so we made the failure describe itself: `describe-screen.py` turns Android's UI dump into
lines like `message.action | Try again`, and the CI annotation shows them. Every later failure
was understood in one run instead of guessed at.

### 4. Screenshots are tests a person reads
With `[screenshots]` in a commit message, CI commits the 15 images back to the branch. They were
checked by eye, in this order of risk: Arabic mirroring (back arrow, top bar, hourly list,
segmented controls), `11°` never `°11`, Latin digits in Arabic, Turkish `%78` and `07:29`, long
Turkish text wrapping. This review found nothing to fix in this app; in the Android app it found
the `°11` bug, and in the iOS app invisible white clouds.

### 5. Ready to ship, not shipped
- Version **1.0.0** in `package.json`, `build.gradle` and the Xcode project; `CHANGELOG.md`.
- The iOS location permission text in Turkish and Arabic (`InfoPlist.strings`), the same words
  as the native iOS app.
- The privacy manifest declares the coarse location sent to Open-Meteo for the forecast (not
  linked to the user, no tracking). The template's list was empty, which would have been wrong.
- [RELEASE_CHECKLIST.md](../process/RELEASE_CHECKLIST.md): signing keys never live in the repo;
  CI's APK is signed with the template's debug key only to install it on the emulator.

## Run it yourself

```bash
git switch step-07-quality-release
npm install
npm test                                   # 226 tests in Node
cd android && ./gradlew assembleRelease && cd ..
# with an emulator running (Android 13+) and Maestro installed:
./scripts/device-tests.sh
```

## How the AI agent helped in this step

| The agent | The human |
|---|---|
| Wrote the journey, the device script and the CI jobs | Approved the end-to-end tool in step 01 (ADR-0009) |
| Read each failure from the CI annotations and fixed the cause | — |
| Reviewed the 15 screenshots, Arabic first | Reviews them again before a release |
| Found the empty privacy declaration by comparing with the iOS app | — |

**What went wrong, and what we learned:**
1. **Five red runs before green.** Each taught something:
   - **No reason given.** The first failure only said "not visible", so the agent added
     `describe-screen.py` (idea 3). **Lesson:** make failures explain themselves before
     fixing them.
   - **No location on the emulator.** The app correctly showed "We couldn't find your location".
     Sending a GPS position (`geo fix`), even every 2 seconds, did not help: the app asks for
     **coarse** location, which comes from Wi-Fi and cell towers, and the emulator has neither.
     The journey now starts **without** location and searches for a city, exactly like the
     Android and iOS journeys; the location path is covered by the Jest journey with fakes.
     **Lesson:** test on the emulator what only the emulator can prove.
   - **"Pixel Launcher isn't responding".** A slow emulator's home screen app froze over ours.
     The script now hides background "not responding" dialogs and lets the system settle; the
     flow taps "Wait" if one still appears.
   - **Screenshot paths.** This Maestro version only writes screenshots inside its own output
     folder; the script copies them to `docs/screenshots/` afterwards.
   - **A slow real API.** On one run the Turkish search was still loading after 30 seconds. The
     app itself may take ~48 s (15 s timeout and two retries), so the test now waits 60 s, and
     a language whose journey fails is run once more, with a line in the log. Two failures in a
     row still fail the build. **Lesson:** a test against a real network needs a budget at
     least as long as the app's own.
2. **An empty privacy declaration.** The React Native template ships a privacy manifest that
   collects "nothing", but the app sends its approximate location to Open-Meteo. Comparing with
   the native iOS app found it. **Lesson:** templates are a start, not an answer.
3. **Small screenshots.** The emulator's default screen is 320 × 640, too small to read in a
   README; the final run uses a Pixel 7 profile.
4. **What is not covered on a device:** the iOS app runs no end-to-end journey in this repo (it
   builds in Release in CI); the current-location path is tested with fakes only. Both are on a
   real phone in the release checklist's manual smoke test.

## Checklist: is step 07 done?
- [x] The release APK (R8) runs the main journey on an emulator in en, tr and ar, in CI
- [x] Screenshots recorded by CI and reviewed
- [x] iOS builds in Release; system texts in three languages; privacy manifest correct
- [x] Version 1.0.0, changelog, release checklist
- [x] README shows the finished app; `PROGRESS.md` updated
