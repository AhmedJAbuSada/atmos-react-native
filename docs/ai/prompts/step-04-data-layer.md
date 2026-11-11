# Prompts — step 04: data layer (React Native)

| Task | Instruction |
|---|---|
| Plan | "Follow the step 04 plan in PROGRESS.md. Port the Android and iOS data layers; keep the same API contract." |
| Network | "`fetch` behind a one-method `HttpClient`. 15 s timeout with `AbortController`; tell a timeout from a cancellation. Retry as a decorator: network errors and 5xx only." |
| Time | "Read the API's local times in the place's IANA zone with `Intl` only. Test daylight saving time." |
| Storage | "AsyncStorage behind `KeyValueStore`. Cache the raw response. Corrupt data is 'no data', never a crash." |
| Location | "Check the permission in the data layer; never request it there. Coarse location only." |
| Tests | "Every test uses the recorded samples. No `jest.mock` of our own code; inject fakes." |
| Libraries | "Read the installed library's type definitions before calling it; do not rely on memory." |
