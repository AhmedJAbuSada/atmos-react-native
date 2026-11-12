#!/usr/bin/env bash
# Runs the Maestro journey on the running emulator, once per language, and keeps the
# screenshots in docs/screenshots/android-<language>/. Called by CI (android-emulator-runner).
set -euo pipefail

APP=dev.ahmedabusada.atmos.rn
APK=android/app/build/outputs/apk/release/app-release.apk
export PATH="$HOME/.maestro/bin:$PATH"

adb install -r "$APK"

for language in en tr ar; do
    echo "::group::Journey in $language"
    # A fresh start: no saved cities, no cached forecast, no granted permission.
    adb shell pm clear "$APP"
    # The per-app language, as the user would set it in Android 13+ settings (ADR-0005).
    adb shell cmd locale set-app-locales "$APP" --locales "$language"
    # Place the emulator in Istanbul (longitude first).
    adb emu geo fix 28.97 41.01
    out="$PWD/docs/screenshots/android-$language"
    mkdir -p "$out" build
    maestro test e2e/journey.yaml --env OUT="$out" --format junit --output "build/e2e-$language.xml"
    echo "::endgroup::"
done
