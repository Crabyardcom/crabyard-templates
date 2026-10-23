# {{APP_NAME}}

Read `AGENTS.md` for project architecture, commands, and coding rules.

- This is a Tauri v2 desktop app using React 19 and strict TypeScript; auth is `{{AUTH_MODULE}}`, UI is `{{UI_MODULE}}`, package manager is `{{PACKAGE_MANAGER}}`.
- Put native operations in Rust commands and call them through typed wrappers in `src/lib/tauri.ts`.
- Update the Rust handler, registration, command map, and TypeScript/Rust models together.
- Use existing UI primitives and preserve keyboard operation, accessible names, and loading/error states.
- Never expose credentials through `VITE_` variables or broaden permissions to bypass a failure.
- Default to no comments; explain only non-obvious constraints, in fewer than two lines.
- Verify frontend changes with `{{PM_RUN}} check` and backend changes with the Rust commands in `AGENTS.md`.
