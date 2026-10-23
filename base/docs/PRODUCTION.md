# Prepare for distribution

## Identity and assets

Confirm product name, bundle identifier, version, author, license, and platform-specific metadata in `src-tauri/tauri.conf.json` and `src-tauri/Cargo.toml`. Replace the crab icon using `{{PM_RUN}} tauri icon public/app-icon.png` with a square source image.

Remove developer onboarding, demo links, and placeholder screens. Verify first launch, settings persistence, offline states, keyboard access, and window controls on every supported OS.

## Authentication

Use an OAuth application of the correct desktop/public-client type. Client IDs may be distributed; client secrets must never be embedded in a desktop app. Development reads `.env`; release binaries do not ship that file. Provide public client IDs through a deliberate release configuration and verify login on an installed build.

The starter auth overlays persist tokens in a local JSON store. Replace that store with the operating system credential manager or a suitable encrypted vault before distributing an authenticated product. Do not describe the starter store as encrypted or secure credential storage. Review token refresh/revocation and account switching requirements for your provider.

## Updates

Automatic update checks remain off by default, and unsigned local production builds do not require an updater key.

1. Generate a signing key using `{{PM_RUN}} tauri signer generate` and keep the private key in CI secrets.
2. Configure `plugins.updater.pubkey` and HTTPS `plugins.updater.endpoints` in `src-tauri/tauri.conf.json`.
3. Set `bundle.createUpdaterArtifacts` to `true` and configure the Tauri signing secrets in the release job.
4. Publish signed update artifacts and the matching update manifest.
5. Set `VITE_UPDATER_ENABLED=true` during the release frontend build and test an update from an installed previous version.

Do not enable automatic updates against an endpoint you do not control.

## Permissions and delivery

The production CSP restricts scripts and connections to bundled assets and Tauri IPC. Add specific hosts only when a feature needs them. Review plugin capabilities rather than granting broad access as a workaround.

Commit one frontend lockfile and `src-tauri/Cargo.lock`. Run `{{PM_RUN}} check`, Rust fmt/clippy/tests, and `{{PM_RUN}} tauri build --no-bundle`. The generated CI compiles on Windows, macOS, and Linux. Configure platform signing/notarization and installer verification for your own release process; passing a compiler does not verify an installed application.
