---
applyTo: "src-tauri/**/*.rs,src-tauri/**/*.toml,src-tauri/**/*.json"
---

Read `AGENTS.md`. Commands return `AppResult<T>` and must be registered in `src-tauri/src/lib.rs`. Update `src/lib/tauri.ts` and mirrored models when IPC changes. Use camelCase serialization, short mutex scopes, bounded input, and the narrowest permissions. Do not hold locks across await or panic on user input. Run cargo fmt, clippy with warnings denied, and cargo test.
