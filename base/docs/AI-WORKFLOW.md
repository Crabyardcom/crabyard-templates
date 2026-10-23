# Continue with a coding agent

Start with a concrete workflow and acceptance criteria. Include the user, input, successful result, error behavior, and any data that must persist. Ask the agent to read `AGENTS.md` and the existing app before editing.

Example request:

> Build a local project organizer in the existing desktop shell. Users can add a folder, rename its display label, search projects, and reopen it after restarting. Keep data local. Include empty/error states and keyboard controls. Verify frontend checks and Rust tests.

For each feature, keep the Rust command, typed wrapper, and shared model changes together. Request behavior tests around persistence, validation, and failure paths when those boundaries change.

Record durable decisions in `AGENTS.md` or `docs/ARCHITECTURE.md`. Keep current product requirements in this repository instead of depending on a previous chat. Review native permission changes and new dependencies before release.

## Supported instruction entry points

| Assistant | Entry point |
| --- | --- |
| Codex and AGENTS-compatible tools | `AGENTS.md` |
| Claude Code | `CLAUDE.md` imports `AGENTS.md` |
| Gemini CLI | `GEMINI.md` imports `AGENTS.md` |
| GitHub Copilot | `.github/copilot-instructions.md` and `.github/instructions/` |
| Cursor | `.cursor/rules/*.mdc` and `AGENTS.md` |
| Windsurf / Cascade | `AGENTS.md` and `.windsurf/rules/project.md` |

These files provide context and conventions. They do not grant external service access or contain credentials.
