# Prompts — step 03: domain layer (React Native)

| Task | Instruction |
|---|---|
| Port | "Port the domain from the Android and iOS apps to TypeScript. Same rules, same tests, idiomatic TypeScript: unions, not classes." |
| Coordinates | "Make invalid coordinates impossible to pass around. Use a branded type." |
| Errors | "Errors are values: a `Result` union and a `DomainError` union. Cancellation is its own kind and is never shown." |
| Fakes | "Shared fakes in `src/testing`; production code must not be able to import them. Prove it with lint." |
| Gate | "Coverage gate 90% on `src/domain`. Run typecheck, lint and tests before pushing." |
