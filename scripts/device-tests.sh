#!/usr/bin/env bash
# Runs the Maestro journey on the running emulator, once per language, and keeps the
# screenshots in docs/screenshots/android-<language>/. Called by CI (android-emulator-runner).
set -euo pipefail

APP=dev.ahmedabusada.atmos.rn
APK=android/app/build/outputs/apk/release/app-release.apk
export PATH="$HOME/.maestro/bin:$PATH"

adb install -r "$APK"

# CI emulators are slow right after boot, and the launcher (not our app) often shows
# "isn't responding". Hide that dialog for background apps and let the system settle.
adb shell settings put global anr_show_background 0
adb shell input keyevent KEYCODE_HOME
sleep 20

# The emulator reports a position only when it is told one. A real phone keeps updating, so
# keep sending Istanbul (longitude first) every 2 seconds while the journeys run.
( while true; do adb emu geo fix 28.97 41.01 >/dev/null 2>&1; sleep 2; done ) &
GEO_PID=$!
trap 'kill "$GEO_PID" 2>/dev/null || true' EXIT

for language in en tr ar; do
    echo "::group::Journey in $language"
    # A fresh start: no saved cities, no cached forecast, no granted permission.
    adb shell pm clear "$APP"
    # The per-app language, as the user would set it in Android 13+ settings (ADR-0005).
    adb shell cmd locale set-app-locales "$APP" --locales "$language"
    out="$PWD/docs/screenshots/android-$language"
    mkdir -p "$out" build
    if ! maestro test e2e/journey.yaml --env OUT="$out" --format junit --output "build/e2e-$language.xml"; then
        # Say what the app was showing: the last lines of this log become the CI annotation.
        adb shell uiautomator dump /sdcard/window.xml >/dev/null 2>&1 || true
        adb pull /sdcard/window.xml build/window.xml >/dev/null 2>&1 || true
        echo "Screen when the journey failed ($language):"
        python3 scripts/describe-screen.py build/window.xml | head -30
        echo "Recent app log:"
        adb logcat -d -t 200 | grep -iE "ReactNativeJS|AndroidRuntime|FATAL" | tail -15 || true
        exit 1
    fi
    echo "::endgroup::"
done
