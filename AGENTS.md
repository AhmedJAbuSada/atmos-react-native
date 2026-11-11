# AGENTS.md — rules for AI coding agents

Read automatically by AI coding agents (Claude Code reads it through `CLAUDE.md`).

## Project
Atmos is a weather app in React Native (bare CLI, TypeScript) for Android and iOS, built as a
**tutorial**. The same app exists natively for Android and iOS and in Flutter; keep the
behaviour identical to the product docs.

## Before you write code
1. Read [`docs/PROGRESS.md`](docs/PROGRESS.md).
2. Read the step guide in [`docs/steps/`](docs/steps/).
3. Find the user story in [`docs/product/USER_STORIES.md`](docs/product/USER_STORIES.md).
4. For anything non-trivial, **write a plan first** and wait for approval.

## Architecture (non-negotiable)
Full rules: [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md).

- `src/domain` imports nothing outside itself: **no `react`, no `react-native`**.
- `src/data` and `src/presentation` import `src/domain`, never each other.
- Only `src/app` (composition root) creates real implementations.
- Fallible functions return `Promise<Result<T>>`; map every failure to a `DomainError` in
  `src/data`; cancellation is `cancelled` and is never shown (ADR-0006).
- One Zustand store (view model) per screen; views take props only.
- Inject a `DateProvider`; never `Date.now()` in logic.

## Code rules
- Follow [`docs/process/CODING_STANDARDS.md`](docs/process/CODING_STANDARDS.md).
- No `any`. No `toUpperCase()`/`toLowerCase()`.
- No inline user-facing strings: add every key to **en, tr and ar**.
- `start` / `end`, never `left` / `right`.

## Tests
- Write tests **with** the change, including a failure path.
- Data tests use the recorded JSON in [`docs/api/samples/`](docs/api/samples/).
- Run before saying "done":
  ```bash
  npm run typecheck && npm run lint && npm test
  ```
  If you cannot run something, **say so**.

## Git
- Conventional Commits; small commits; update `docs/PROGRESS.md` at the end of a session.

## Do not
- Add dependencies without an ADR or approval.
- Add features that are not in the PRD.
- Commit secrets, keystores or signing files.
- Change an accepted ADR: supersede it.
- Disable a lint rule or a test to make the build pass.

## When unsure
Stop and ask.
