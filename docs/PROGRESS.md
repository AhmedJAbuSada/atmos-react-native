# Progress — hand-over note

> Read this first at the start of every work session (human or AI). Update it at the end.

**Current step:** 06, integration ✅ done
**Next up:** step 07, quality and release (`step-07-quality-release`)
**Last updated:** 2026-11-11

## Status

| Step | Status | Branch |
|---|---|---|
| 01 Planning | ✅ Done | `step-01-planning` |
| 02 Project structure | ✅ Done | `step-02-project-structure` |
| 03 Domain layer | ✅ Done | `step-03-domain-layer` |
| 04 Data layer | ✅ Done | `step-04-data-layer` |
| 05 Presentation / UI | ✅ Done | `step-05-presentation-ui` |
| 06 Integration | ✅ Done | `step-06-integration` |
| 07 Quality & release | ⏳ Next | `step-07-quality-release` |

## Next up: step 07 plan
Make it releasable, with the same bar as the native apps. Maestro is already decided (ADR-0009).
1. **End to end on an emulator:** a Maestro flow in CI on an Android emulator (search a city,
   add it, open it, change the unit), run in en, tr and ar. Stable `testID`s already exist
   (`cities.search`, `cities.add.<id>`, `home.current`, …). The app needs a way to start without
   real location in CI: decide how (a launch argument, or granting the permission with `adb`).
2. **Screenshots:** the flow saves screenshots per language; CI commits them back when the
   commit message contains `[screenshots]`, as in the Android and iOS repos. Look at them: the
   Android bidi bug and the iOS invisible clouds were both found this way.
3. **System texts translated:** the iOS location permission text (`NSLocationWhenInUseUsageDescription`)
   in tr and ar through `InfoPlist.strings`; check the Android app name and any system strings.
4. **Release builds:** Android release build (R8) and iOS Release build in CI; version 1.0.0 in
   `package.json`, `build.gradle` and the Xcode project; iOS `PrivacyInfo.xcprivacy` for the
   APIs AsyncStorage uses.
5. **Accessibility pass:** largest font size and TalkBack/VoiceOver labels, checked on the
   screenshots; fix what they show.
6. Docs: the finished README (what the app does, screenshots, how to run, the seven steps), the
   step 07 guide with what went wrong, and a release checklist. Add the `rn` platform to the
   "finished" list in the branch README script.

## Process rule
After a step is merged into `main`, add the "📍 You are on Step N" section to the top of that
step branch's README, then push the branch.

## Notes for the next session
- Real Open-Meteo responses are in `docs/api/samples/`; tests import them through
  `__tests__/support/samples.ts`.
- The iOS location text in `Info.plist` is English only: translate it in step 07.
- Views take `state` + callbacks; render any of them in a language with
  `__tests__/support/render.tsx`.
- `src/app/main.tsx` is the real entry point; `App` receives its dependencies, so
  `__tests__/App.test.tsx` runs the whole app with fakes.
- Node 22; the Android SDK can be installed to `/opt/android-sdk` in cloud sessions.
