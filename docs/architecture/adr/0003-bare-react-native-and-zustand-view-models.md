# ADR-0003: Bare React Native CLI; view models as Zustand stores

- **Status:** Accepted
- **Date:** 2026-11-11

## Context
We need a React Native setup and a presentation pattern that are testable and comparable with
the ViewModel (Android) and `@Observable` view model (iOS) of the other repos.

## Decision
- **Project:** the bare React Native CLI template (New Architecture), with the `android/` and
  `ios/` folders in the repository, so readers see the native side too.
- **View models:** one [Zustand](https://github.com/pmndrs/zustand) *vanilla* store per
  screen, created by a factory that receives its use cases. A store holds one `state` object
  and exposes methods; it works without React, so it is tested as a plain object.
- **Screens:** a container reads the store with `useStore`; a view component takes props only.

## Alternatives considered
| Option | Why not |
|---|---|
| Expo | The recommended way to start, and excellent; the human chose the bare CLI to show the native projects. |
| Redux Toolkit | Powerful, but more ceremony than one store per screen needs. |
| React state and hooks only | Logic ends up inside components and needs React to test. |
| TanStack Query | A server-cache library; our cache-first rule already lives in the domain. |

## Consequences
- ✅ The same "state in, events out" model as the other three apps.
- ⚠️ Bare React Native means we maintain the native projects (upgrades with the Upgrade Helper).
