# ADR-0004: Dependency injection — one composition root, provided by React Context

- **Status:** Accepted
- **Date:** 2026-11-11

## Decision
`src/app/composition.ts` creates the real repositories, the use cases and the view model
stores **once**. A React Context hands them to the screens. Every function and store receives
its dependencies as parameters; nothing imports a singleton.

## Alternatives considered
| Option | Why not |
|---|---|
| InversifyJS, tsyringe | Decorators and reflection for a graph of ~15 objects. |
| Module-level singletons (`export const api = …`) | Tests must mock modules (`jest.mock`) instead of passing fakes. |

## Consequences
- ✅ Tests pass fakes as arguments; no module mocking.
- ✅ Same idea as iOS's `AppContainer` and Android's Hilt graph.
