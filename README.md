# Crabyard templates

Modular application source for the [Crabyard CLI](https://github.com/Crabyardcom/crabyard-cli). This is an independent template repository, not an application workspace.

| Path | Purpose |
| --- | --- |
| `base/` | Shared Tauri v2, React, TypeScript, tests, CI, and assistant instructions |
| `auth/` | GitHub device flow, Google PKCE, or no authentication |
| `ui/` | shadcn, DaisyUI, tesign, or minimal Tailwind |
| `manifest.toml` | Template version and overlay catalogue |
| `scripts/sync-tesign.mjs` | Inspect changes from the independent tesign repository |

## Generate locally

```sh
git clone https://github.com/Crabyardcom/crabyard-cli ../crabyard-cli
cargo run --manifest-path ../crabyard-cli/Cargo.toml -- new "Example" --template . --auth none --ui shadcn --pm npm --yes --no-install --no-git --output ../example
cd ../example
npm install
npm run check
npm run tauri dev
```

The source contains placeholders and overlay markers. Validate generated applications, not the unexpanded source. The repository workflow checks all twelve auth/UI combinations and Rust compilation across Linux, macOS, and Windows.

## Publishing

Keep the template version compatible with the consuming CLI version. A `v*` tag packages `base/`, `auth/`, `ui/`, and `manifest.toml` and uploads the archive to the license API. Configure the repository secret `ADMIN_KEY` and optional repository variable `API_URL`. CLI binaries release independently from `crabyard-cli`.

Generated app updater releases require the developer's own signing key and public key. [Tauri's updater documentation](https://tauri.app/plugin/updater/) describes the required configuration. No signing keys or OAuth client secrets belong in this template.
