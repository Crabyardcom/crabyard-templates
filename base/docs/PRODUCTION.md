# Prepare for distribution

## Identity and assets

Confirm product name, bundle identifier, version, author, license, and platform-specific metadata in `src-tauri/tauri.conf.json` and `src-tauri/Cargo.toml`. Replace the crab icon using `{{PM_RUN}} tauri icon public/app-icon.png` with a square source image.

Remove developer onboarding, demo links, and placeholder screens. Verify first launch, settings persistence, offline states, keyboard access, and window controls on every supported OS.

## Authentication

Use an OAuth application of the correct desktop/public-client type. Client IDs may be distributed; client secrets must never be embedded in a desktop app. Development reads `.env`; release binaries do not ship that file. `build.rs` embeds only the public `GITHUB_CLIENT_ID` and `GOOGLE_CLIENT_ID` supplied during compilation. Authentication prefers a valid runtime override, then the compiled public ID; placeholders are rejected. Set the selected provider's repository variable before the release build and verify login on an installed build.

OAuth credentials use Windows Credential Manager, macOS Keychain, or the Linux desktop Secret Service through [keyring's native desktop backends](https://docs.rs/keyring/4.2.0/keyring/v1/index.html). Linux users need an available, unlocked Secret Service in their graphical session. Vault access runs on a blocking worker; unavailable or locked vaults return errors, and there is no plaintext fallback.

The application bundle identifier is the vault service, with a separate entry per OAuth provider. Access and optional refresh tokens are saved together. If a provider omits a new refresh token, the existing refresh token is retained. Changing the bundle identifier creates a new credential namespace.

Existing `auth.json` files are deleted without reading or importing their contents; users upgrading from an older scaffold must sign in again. Review provider-specific token renewal, revocation, and account-switching workflows before release. The included unit tests use an in-memory credential boundary and never access developers' real vaults.

## Updates

Automatic update checks remain off by default, and unsigned local production builds do not require an updater key.

1. Generate an updater signing key using `{{PM_RUN}} tauri signer generate`. Put its private key in the `TAURI_SIGNING_PRIVATE_KEY` repository secret and its optional password in `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`.
2. Configure `plugins.updater.pubkey`, HTTPS `plugins.updater.endpoints`, and `bundle.createUpdaterArtifacts: true` in `src-tauri/tauri.conf.json`. Use an endpoint you control; GitHub Releases can serve the generated `latest.json`.
3. Commit the frontend lockfile and `src-tauri/Cargo.lock`. Keep package, Cargo, and Tauri versions equal.
4. For GitHub/Google auth, configure repository variable `GITHUB_CLIENT_ID` or `GOOGLE_CLIENT_ID`. Public IDs are compiled into the installed app. Never supply client secrets.
5. Configure Windows signing secrets `WINDOWS_CERTIFICATE` (base64 PFX) and `WINDOWS_CERTIFICATE_PASSWORD`. The workflow imports the certificate and supplies its thumbprint to the Tauri bundler.
6. Configure macOS signing/notarization secrets `APPLE_CERTIFICATE` (base64 P12), `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD` (app-specific password), and `APPLE_TEAM_ID`.
7. Set repository variable `RELEASE_ENABLED=true`. Create the matching version tag and manually run **Signed desktop release** with that existing tag.
8. Inspect the draft release's Windows installer, Linux packages, Intel/Apple Silicon macOS installers, signatures, and updater manifest. Test installation and updating from an installed previous version before publishing the draft.

The generated `.github/workflows/release.yml` is inert until explicitly enabled. `scripts/release.mjs` blocks missing locks, version drift, unconfigured auth, unsafe updater endpoints, and missing signing credentials before building. Release builds set `VITE_UPDATER_ENABLED=true`; local production builds keep updates disabled. Windows installers use Authenticode, macOS builds use signing/notarization, and updater artifacts are signed on every target. Linux packages are accompanied by updater signatures; this workflow does not configure a distribution package repository.

Do not enable automatic updates against an endpoint you do not control.

## Permissions and delivery

The production CSP restricts scripts and connections to bundled assets and Tauri IPC. Add specific hosts only when a feature needs them. Review plugin capabilities rather than granting broad access as a workaround.

Commit one frontend lockfile and `src-tauri/Cargo.lock`. Run `{{PM_RUN}} check`, Rust fmt/clippy/tests, and `{{PM_RUN}} tauri build --no-bundle`. The generated CI compiles on Windows, macOS, and Linux. Configure platform signing/notarization and installer verification for your own release process; passing a compiler does not verify an installed application.
