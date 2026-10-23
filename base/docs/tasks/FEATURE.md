# Feature brief

Status: unplanned

## User-visible change

[Describe one workflow and why the user needs it. Include starting state, action, and observable result.]

## Acceptance examples

| Given | When | Then |
| --- | --- | --- |
| [initial data/state] | [user action] | [visible result and persisted change] |
| [invalid input] | [attempted action] | [error, focus, and preserved data] |
| [network/disk failure] | [attempted action] | [recovery path and unchanged data] |

## Implementation boundary

- Screens and existing primitives: [paths]
- Rust commands and typed wrappers: [names and payloads]
- Persistent schema and migration: [data change or none]
- Native capabilities: [minimum permissions or none]
- Dependencies: [concrete need or none]
- Exclusions: [explicitly deferred work]

## Verification and handoff

- Regression tests: [observable behavior at affected boundaries]
- Commands: `{{PM_RUN}} check`; Rust fmt, Clippy, and tests for native changes.
- Manual installed-app checks: [platform and workflow]
- Update `docs/HANDOFF.md` with verified results, changed decisions, and the next concrete task.
