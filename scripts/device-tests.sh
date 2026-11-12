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

for language in en tr ar; do
    echo "::group::Journey in $language"
    # A fresh start: no saved cities, no cached forecast, no location permission.
    adb shell pm clear "$APP"
    # The per-app language, as the user would set it in Android 13+ settings (ADR-0005).
    adb shell cmd locale set-app-locales "$APP" --locales "$language"
    out="$PWD/docs/screenshots/android-$language"
    mkdir -p "$out" build
    results="build/maestro-$language"
    run_journey() {
        maestro test e2e/journey.yaml --test-output-dir "$results" --format junit --output "build/e2e-$language.xml"
    }
    # The journey uses the real API over the runner's network. One retry absorbs a slow
    # moment there; the log says so, and two failures in a row still fail the build.
    passed=no
    if run_journey; then
        passed=yes
    else
        echo "Retrying the $language journey once (real network)."
        adb shell pm clear "$APP"
        adb shell cmd locale set-app-locales "$APP" --locales "$language"
        rm -rf "$results"
        if run_journey; then passed=yes; fi
    fi
    if [ "$passed" = no ]; then
        # Say what the app was showing: the last lines of this log become the CI annotation.
        adb shell uiautomator dump /sdcard/window.xml >/dev/null 2>&1 || true
        adb pull /sdcard/window.xml build/window.xml >/dev/null 2>&1 || true
        echo "Screen when the journey failed ($language):"
        python3 scripts/describe-screen.py build/window.xml | head -30
        echo "Recent app log:"
        adb logcat -d -t 200 | grep -iE "ReactNativeJS|AndroidRuntime|FATAL" | tail -15 || true
        exit 1
    fi
    # Maestro keeps screenshots in its output folder; the README uses docs/screenshots.
    find "$results" -name "*.png" -exec cp {} "$out/" \;
    ls "$out"
    echo "::endgroup::"
done
