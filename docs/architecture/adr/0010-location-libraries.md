# ADR-0010: Location — community Geolocation and react-native-permissions

- **Status:** Accepted
- **Date:** 2026-11-11

## Context
US-01 needs the device position once, when the app opens, and only if the user allowed it.
React Native has no built-in location API since 0.60, and no built-in permission API on iOS.
The native apps use FusedLocationProviderClient (Android) and CoreLocation (iOS); this app needs
one TypeScript call that works on both.

## Decision
- **[`@react-native-community/geolocation`](https://github.com/michalchudziak/react-native-geolocation)**
  reads the position (`getCurrentPosition`, coarse accuracy, 15 s timeout, a 10-minute-old fix
  is fine).
- **[`react-native-permissions`](https://github.com/zoontek/react-native-permissions)** checks
  and requests the permission with one API on both platforms (`check` / `request`), and links
  **only** the iOS permission handlers listed in the Podfile (`LocationWhenInUse`).
- Both sit behind a `LocationPlatform` interface in `src/data/location`; the repository logic
  is tested with a fake, and the domain only sees `LocationRepository`.

## Alternatives considered
| Option | Why not |
|---|---|
| `react-native-geolocation-service` | Unmaintained since 2022. |
| Expo Location | Needs the Expo modules runtime in a bare app (ADR-0003 chose bare CLI). |
| `PermissionsAndroid` + the Geolocation iOS prompt | Two different permission flows to keep in sync; no iOS "check without asking". |
| Writing a native module | Teaches native bridging, not this step; more code to maintain. |

## Consequences
- ✅ One `check()` call tells "granted / denied / unavailable" on both platforms, so the data
  layer **never** shows a prompt. Asking is a UI decision (step 06).
- ✅ Coarse location only: the user shares less, and the forecast does not need more.
- ⚠️ Two native dependencies: `pod install` and a Gradle sync after an upgrade. Renovate-style
  upgrades must run the iOS and Android CI builds.
- ⚠️ The iOS Podfile must call `setup_permissions`, or every check answers "unavailable".
