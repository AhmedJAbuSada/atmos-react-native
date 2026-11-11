# Prompts — step 01: planning (React Native)

> Same product, third codebase. Reuse the product documents; write the architecture for React
> Native. The human chose the **bare React Native CLI** (not Expo) to show the native projects.

| Task | Instruction |
|---|---|
| Shared docs | "Copy the product docs, API contract and samples; change only the platform facts." |
| Architecture | "Same three layers. TypeScript has no module boundaries: how will we enforce them?" → ESLint boundaries (ADR-0001). |
| View models | "What is the React Native equivalent of a ViewModel that tests without the UI?" → Zustand vanilla stores (ADR-0003). |
| Lessons | "Carry over: one source of truth for the language, directional isolates in RTL text, CI that explains its failures." |
