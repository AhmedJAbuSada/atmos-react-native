# Prompts — step 05: presentation / UI (React Native)

| Task | Instruction |
|---|---|
| Plan | "Follow the step 05 plan in PROGRESS.md. Views take state and callbacks only: no store, no navigation." |
| Library | "The plan does not name a library for the OS language. Ask before adding one." (answer: `react-native-localize`, ADR-0011) |
| Strings | "Generate en, tr and ar from the iOS String Catalog. Same texts, i18next format, plurals included. Type the keys." |
| Formatting | "Port the iOS WeatherFormatter to Intl: Latin digits for Arabic, directional isolates around every value, times at the place." |
| RTL | "React Native has no lint check for left/right styles. Write one." |
| Tests | "Test every screen state, in all three languages, with Testing Library. Query by text, label and role." |
| Honesty | "Check requirement IDs against the PRD before citing them." |
