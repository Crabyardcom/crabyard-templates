# {{APP_NAME}} product brief

Status: needs product decisions. Replace each bracketed prompt with a concrete answer before requesting substantial implementation.

## User and outcome

- Primary user: [who uses the desktop app and in what setting]
- Painful workflow: [what they do today, including repeated manual steps]
- Successful outcome: [observable result and how it will be measured]

## First complete workflow

1. [What the user opens or imports]
2. [What they change or decide]
3. [What is saved, exported, or delivered]

## Product boundaries

- Included in the first release: [small set of complete workflows]
- Deferred: [explicit exclusions]
- Platforms: [Windows, macOS, Linux]
- Data ownership and offline behavior: [local data, network needs, retention]
- Accessibility and keyboard requirements: [concrete operations]
- Authentication: `{{AUTH_MODULE}}`; UI: `{{UI_MODULE}}`

## Data and recovery

- Records and invariants: [entities, validation, relationships]
- Data location: [application data directory by default]
- Import/export and backup: [format, restore steps, deletion behavior]
- Conflict policy: [what the user sees when a saved revision is stale]

## Release acceptance

- [ ] A fresh installation can complete the primary workflow.
- [ ] Saved data survives restart and the previous app version's data is preserved.
- [ ] Empty, invalid, offline, and permission-denied states are usable.
- [ ] Keyboard navigation and error recovery have been checked on supported platforms.
- [ ] `{{PM_RUN}} check` and the Rust checks pass.
- [ ] Distribution identity, signing, updates, and installed-app verification are complete.
