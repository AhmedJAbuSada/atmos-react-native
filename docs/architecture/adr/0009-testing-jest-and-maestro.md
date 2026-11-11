# ADR-0009: Testing — Jest, React Native Testing Library, Maestro

- **Status:** Accepted
- **Date:** 2026-11-11

## Decision
- **Jest** for domain, data and view models: plain TypeScript, fast, in Node.
- **React Native Testing Library** for components: render each screen state and query it the
  way a user (and a screen reader) would, by text and accessibility role.
- **[Maestro](https://maestro.mobile.dev/)** for the end-to-end journey on an Android emulator
  in CI: short YAML flows, no test code inside the app.

## Alternatives considered
| Option | Why not |
|---|---|
| Detox | Powerful, but needs native test builds and more setup than one journey requires. |
| Appium | Heavier still; meant for cross-app and device-farm testing. |

## Consequences
- ✅ The same test pyramid as the native apps: many fast unit tests, one real journey.
