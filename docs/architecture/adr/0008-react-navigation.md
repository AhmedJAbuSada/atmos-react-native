# ADR-0008: Navigation — React Navigation native stack, typed routes

- **Status:** Accepted
- **Date:** 2026-11-11

## Decision
[React Navigation](https://reactnavigation.org/) with the **native stack** (real
`UINavigationController` and Android fragments), and a `RootStackParamList` type so a route
name or parameter typo is a TypeScript error. Routes: Home, Cities, Settings, About.

## Consequences
- ✅ Native transitions and back gestures; RTL-aware out of the box.
