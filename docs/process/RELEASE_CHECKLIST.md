# Release checklist (React Native)

## Before
- [ ] `main` is green: typecheck, lint, Jest (coverage gates), Android release build (R8), the
      Maestro journey on the emulator in en, tr and ar, iOS Release build.
- [ ] The version is the same in `package.json`, `android/app/build.gradle` (`versionName`, and
      `versionCode` + 1) and the Xcode project (`MARKETING_VERSION`, `CURRENT_PROJECT_VERSION`).
- [ ] `CHANGELOG.md` updated.
- [ ] Screenshots recorded (`[screenshots]` in a commit message) and **looked at** in all three
      languages: layout mirrored in Arabic, `11°` never `°11`, Latin digits, Turkish `%69`.
- [ ] Translations reviewed by a native speaker (until then the README says they are AI-written).
- [ ] Privacy: `ios/Atmos/PrivacyInfo.xcprivacy` still matches what the app does (coarse
      location sent to Open-Meteo for the forecast, nothing else); the Play Console data-safety
      form says the same.

## Build and upload
Keystores, `key.properties`, signing certificates and provisioning profiles are **never** in the
repository. CI signs the release APK with the template's debug key, only to install it on the
emulator; that APK must never be uploaded.

**Android**, with the team's upload key outside the repo (for example in `~/.gradle/gradle.properties`
or CI secrets, read by a `release` signing config):
```bash
cd android && ./gradlew bundleRelease   # app/build/outputs/bundle/release/app-release.aab
```
Upload the `.aab` to the Play Console, internal testing track first.

**iOS**, on a Mac with the team's Apple Developer account:
```bash
cd ios && pod install && cd ..
xcodebuild archive -workspace ios/Atmos.xcworkspace -scheme Atmos -configuration Release \
  -archivePath build/Atmos.xcarchive
```
Upload with Xcode's Organizer or Transporter; TestFlight first.

- [ ] Manual smoke test on a real phone of each platform: location allowed, location denied,
      search, offline (airplane mode), Arabic, Turkish, largest text size, dark mode.

## After
- [ ] GitHub Release `v1.0.0` from `main` (the owner creates the tag).
- [ ] Watch crash reports for a day before releasing to everyone.
