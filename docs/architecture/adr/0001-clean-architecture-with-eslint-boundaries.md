# ADR-0001: Clean Architecture enforced by ESLint boundaries

- **Status:** Accepted
- **Date:** 2026-11-11

## Context
Android enforces the layers with Gradle modules, iOS with Swift package targets. In a
TypeScript app, every file can import every other file, and npm workspaces for three layers
would complicate Metro (the bundler) for no real gain.

## Decision
Three folders, `src/domain`, `src/data`, `src/presentation`, plus `src/app` (composition root).
[`eslint-plugin-boundaries`](https://github.com/javierbrea/eslint-plugin-boundaries) declares
the allowed imports between them, and `no-restricted-imports` keeps `react` and
`react-native` out of the domain. ESLint runs in CI with `--max-warnings 0`.

## Alternatives considered
| Option | Why not |
|---|---|
| Folders only, rely on review | Nothing stops a stray import. |
| npm/yarn workspaces, one package per layer | Real boundaries, but Metro and native autolinking get harder; heavy for one app. |
| TypeScript project references | Enforce build order, but are awkward with Metro and Jest. |

## Consequences
- ✅ A wrong import fails CI, with a message naming the rule.
- ✅ The domain runs in plain Node: fast tests.
- ⚠️ It is a lint error, not a compile error: run `npm run lint` locally (and in a Git hook).
