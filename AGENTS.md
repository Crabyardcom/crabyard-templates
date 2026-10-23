# Crabyard templates

The generator lives at https://github.com/Crabyardcom/crabyard-cli. This repository contains `base/`, auth/UI overlays, and the template manifest.

- Files in `base/` are copied into generated applications. Keep repository maintenance files outside it.
- Keep `{{TOKEN}}` placeholders and `// @crabyard:` markers intact. Check the generator before changing either format.
- Validate every affected auth/UI combination with the real CLI. A template source file with unresolved tokens is not directly buildable.
- Keep capabilities limited to the selected app features. Never ship credentials, signing keys, or OAuth client secrets.
- Maintain generated assistant guidance with architecture or command changes.
- Run the generated app's `check` script and Rust checks before calling a scaffold verified.
- Default to no comments unless a nonobvious constraint needs explanation; keep them under two lines.
