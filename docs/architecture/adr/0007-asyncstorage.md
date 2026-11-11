# ADR-0007: Storage — AsyncStorage

- **Status:** Accepted
- **Date:** 2026-11-11

## Decision
Saved cities, the forecast cache (the raw API response and the fetch time) and the settings are
JSON values in [AsyncStorage](https://react-native-async-storage.github.io/async-storage/),
behind a small `KeyValueStore` interface, so tests use an in-memory store.

## Alternatives considered
| Option | Why not |
|---|---|
| SQLite / WatermelonDB | Queries we do not need, for a list of ten cities. |
| MMKV | Faster, but a native dependency for data this small. |

## Consequences
- ✅ The same "raw response, mapped on read" cache as the other apps.
- ⚠️ AsyncStorage is unencrypted: fine here, there is no personal data.
