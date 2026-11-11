# ADR-0006: Errors as values — a `Result` union with `DomainError`

- **Status:** Accepted
- **Date:** 2026-11-11

## Decision
```ts
type DomainError =
  | { kind: 'noConnection' } | { kind: 'timeout' } | { kind: 'server'; code: number }
  | { kind: 'notFound' } | { kind: 'locationPermissionDenied' } | { kind: 'locationUnavailable' }
  | { kind: 'cancelled' } | { kind: 'unknown' };

type Result<T> = { ok: true; value: T } | { ok: false; error: DomainError };
```
Repositories catch every exception at the boundary and return a `Result`. A `switch` on
`error.kind` with an exhaustive `never` check makes the compiler point to every place a new
error must be handled. Cancellation (`AbortController`) becomes `cancelled` and is never shown.

## Alternatives considered
| Option | Why not |
|---|---|
| `throw` and `try/catch` | TypeScript does not type thrown errors; callers guess. |
| A library (neverthrow, fp-ts) | Good, but a dependency for one small type. |

## Consequences
- ✅ The same model as Android's `AppResult` and iOS's typed throws.
