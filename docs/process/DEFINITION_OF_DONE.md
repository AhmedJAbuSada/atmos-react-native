# Definition of Done

A story or task is **done** only when every box is ticked. This applies equally to code
written by a person and code written by an AI agent.

## Code
- [ ] Meets every acceptance criterion of its user story.
- [ ] Follows the [architecture rules](../architecture/ARCHITECTURE.md) and
      [coding standards](CODING_STANDARDS.md).
- [ ] No hard-coded user-facing strings; English, Turkish and Arabic added to `src/presentation/i18n/` (en, tr, ar).
- [ ] `npm run typecheck` and `npm run lint` pass (including the architecture and casing rules).

## Tests
- [ ] Unit tests for new logic, including at least one **failure** path.
- [ ] Existing tests pass locally and in CI.
- [ ] Coverage of `src/domain` and `src/data` did not drop.

## UI (if the change has UI)
- [ ] Checked in light and dark mode.
- [ ] Checked in **Arabic (RTL)** and **Turkish**.
- [ ] Checked with the largest system font size, on Android and iOS.
- [ ] Loading, empty and error states exist.
- [ ] Screenshots attached to the PR.

## Review
- [ ] PR template filled in.
- [ ] Approved by at least one human reviewer.
- [ ] CI is green.

## Docs
- [ ] README, ADRs or step guide updated if behaviour or decisions changed.
- [ ] `docs/PROGRESS.md` updated.
