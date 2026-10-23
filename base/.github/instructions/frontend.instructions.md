---
applyTo: "src/**/*.ts,src/**/*.tsx,src/**/*.css"
---

Read `AGENTS.md`. Use strict types, the `@/` import alias, existing `src/components/ui/` primitives, and CSS theme variables. The UI module is `{{UI_MODULE}}`; inspect its component props before using them. Import typed backend wrappers from `src/lib/tauri.ts`. Keep native work in Rust. Test observable behavior with Vitest and Testing Library. Run `{{PM_RUN}} check`.
