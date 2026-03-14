# Crabyard Scaffold — Project Memory

## Project
Converting a GitHub Repo Syncer Tauri v2 app into a reusable Crabyard starter template.
Working dir: `c:\Users\Yannick\Desktop\programming\desktop applicatzion github\scaffold`

## Phase 0: COMPLETE — Scaffold extraction

All business-specific code removed. Template is clean. Both checks pass:
- `cargo check` — passes (1 expected warning: `NotAuthenticated` variant unused in base scaffold)
- `tsc --noEmit` — passes cleanly (0 errors)

## Key architectural decisions

### Token system
- `{{APP_SLUG}}`, `{{APP_SLUG_SNAKE}}`, `{{APP_NAME}}`, `{{APP_BUNDLE_ID}}`, `{{APP_VERSION}}`, `{{APP_DESCRIPTION}}`, `{{APP_AUTHOR}}`
- Tokens in `.toml`, `.json`, `.rs` string literals are fine — generator does find-replace
- `{{APP_SLUG_SNAKE}}_lib::run()` in `main.rs` is NOT valid Rust until replaced — accepted by design
- **Do NOT use `{{TOKEN}}` in TSX/JSX** — curly braces are JSX expression delimiters, causes TS errors

### App name in frontend
- `VITE_APP_NAME` env var (not `{{APP_NAME}}` token) is used in TSX components
- `src/vite-env.d.ts` declares `ImportMetaEnv` with `VITE_APP_NAME: string`
- `.env.example` has `VITE_APP_NAME={{APP_NAME}}` — generator replaces this token
- Components use `{import.meta.env.VITE_APP_NAME}`

### Rust auth module structure
```
src-tauri/src/auth/
  device_flow.rs   — GitHub Device Flow OAuth (reads GITHUB_CLIENT_ID from env)
  token_store.rs   — tauri-plugin-store persistence (auth.json)
  validate.rs      — fetch GitHub user to verify token
```

### Missing `use tauri::Manager`
- `lib.rs` requires `use tauri::Manager;` for `app.manage()` to work
- This was missing and caused `cargo check` to fail — now fixed

### Cargo.toml lib name
- `[lib] name = "{{APP_SLUG_SNAKE}}_lib"` — tokenized, generator replaces
- `main.rs` calls `{{APP_SLUG_SNAKE}}_lib::run()` — also tokenized

## Tool quirks (this project)
- Write/Edit tools sometimes fail with "File has not been read yet" — fall back to Bash heredoc
- Bash heredoc: use single-quoted delimiter `<< 'EOF'` to prevent `${}` interpolation
- Don't batch too many files in one heredoc — shell command length limit causes EOF errors
- Path with spaces: always quote as `"/c/Users/Yannick/Desktop/programming/desktop applicatzion github/scaffold"`

## Validation approach
Template files aren't directly compilable (tokenized). Validate with:
```bash
TMPDIR=$(mktemp -d)
cp -r src-tauri "$TMPDIR/"
find "$TMPDIR" -type f \( -name "*.toml" -o -name "*.rs" -o -name "*.json" \) -print0 | \
  xargs -0 sed -i -e 's/{{APP_SLUG_SNAKE}}/scaffold/g' -e 's/{{APP_SLUG}}/scaffold/g' \
    -e 's/{{APP_VERSION}}/0.1.0/g' -e 's/{{APP_DESCRIPTION}}/Test/g' \
    -e 's/{{APP_AUTHOR}}/Author/g' -e 's/{{APP_NAME}}/Scaffold/g' \
    -e 's/{{APP_BUNDLE_ID}}/com.example.scaffold/g'
cd "$TMPDIR/src-tauri" && cargo check
```

## Phase 1: COMPLETE — crabyard CLI generator

Location: `c:\Users\Yannick\Desktop\programming\desktop applicatzion github\crabyard-cli\`
Files: `src/main.rs`, `src/generate.rs`, `src/tokens.rs`, `src/hooks.rs`

### CLI usage
```bash
# Interactive
CRABYARD_TEMPLATE=../scaffold crabyard new

# Non-interactive (app name given, all other values defaulted)
CRABYARD_TEMPLATE=../scaffold crabyard new "My App" --yes --no-git --no-install
```

### Key design decisions
- `--yes` flag: accepts all defaults without prompting (needed for CI and web platform)
- Non-interactive when `--yes` OR when `app_name + slug + bundle_id` all provided as flags
- Binary files (png, ico, lock) copied as-is; text files get `{{TOKEN}}` replacement
- `.claude`, `node_modules`, `target`, `.git`, `dist` skipped during copy
- `.env` created from `.env.example` (tokens already substituted) at generation time
- Template resolved: `--template` flag → `CRABYARD_TEMPLATE` env → `~/.crabyard/templates/`
- `config.template` must be `.clone()`d before passing to `resolve_template` (partial move issue)

### Validated end-to-end
- Generated project passes `cargo check` (1 expected warning)
- Generated project passes `bun install` + `tsc --noEmit` (0 errors)

## Phase 1 continued: COMPLETE — install scripts, CI, doctor

### Install scripts
- `install.sh` — `curl -fsSL .../install.sh | sh` (detects OS/arch, installs to `~/.crabyard/bin/`, adds to PATH)
- `install.ps1` — `irm .../install.ps1 | iex` (detects arch, installs to `~/.crabyard/bin/`, adds to user PATH)
- Both support `CRABYARD_VERSION` and `CRABYARD_INSTALL_DIR` env overrides
- GitHub repo: `Demoen/crabyard-cli`

### GitHub Actions release workflow
- `.github/workflows/release.yml` — triggers on `v*` tag push
- Builds: linux-x86_64, linux-aarch64 (cross), macos-x86_64, macos-aarch64, windows-x86_64
- Unix: `.tar.gz`, Windows: `.zip`
- Uses `softprops/action-gh-release@v2` with auto release notes

### crabyard doctor
- `src/doctor.rs` — checks Rust, Cargo, Node.js, package manager, Git, Tauri CLI
- Windows: checks WebView2 via winreg (cfg(windows) dependency)
- Linux: checks webkit2gtk, gtk3, libsoup3 via pkg-config
- Status: ✓ Ok, ! Warning (optional), ✗ Missing (required)

### Cargo.toml addition
- `[target.'cfg(windows)'.dependencies] winreg = "0.55"`

## Phase 2: COMPLETE — Modular overlay system

### Overlay structure
```
scaffold/
  base/          — Core template with CRABYARD markers
  auth/github/   — GitHub Device Flow OAuth overlay
  auth/google/   — Google OAuth (browser-based) overlay
  auth/none/     — No-auth overlay (strips auth code)
  ui/shadcn/     — shadcn/ui overlay (default)
  ui/daisyui/    — DaisyUI overlay
  manifest.toml  — Module option definitions
```

### CLI flags
```bash
crabyard new "My App" --auth github|google|none --ui shadcn|daisyui
```

### Assembly pipeline
1. Copy `base/` as foundation
2. Apply auth overlay (file copies + inject Cargo deps at `# CRABYARD:AUTH_DEPS`)
3. Apply UI overlay (file copies + merge npm deps from `module.json`)
4. Replace `{{TOKEN}}` placeholders

### Key fixes during validation
- `auth/google/src/components/LoginView.tsx`: `import { open }` → `import { openUrl }` from `@tauri-apps/plugin-opener`
- `auth/none/src/components/DashboardView.tsx`: removed unused `Button` import (TS6133)

### All 6 combos validated
- github+shadcn, github+daisyui, google+shadcn, google+daisyui, none+shadcn, none+daisyui
- All pass `cargo check` (warnings only) and `tsc --noEmit` (zero errors)

## Phase 3: COMPLETE — License validation + API + template distribution

### CLI additions
- `--license-key` flag (also `CRABYARD_LICENSE_KEY` env)
- `src/license.rs` — validates key via API, downloads + caches template tarball
- Template resolution order: `--template` flag → license key → `~/.crabyard/templates/`
- Cached at `{cache_dir}/crabyard/templates/{version}/`
- New deps: `reqwest` (blocking+json), `flate2`, `tar`, `dirs`

### Cloudflare Worker API (`crabyard-api/`)
- Hono router on Cloudflare Workers
- D1 database for license storage
- R2 bucket for template tarball hosting

#### Endpoints
- `POST /license/validate` — validates license key, returns `{ valid, plan }`
- `GET /template/:version` — downloads template tarball (Bearer auth with license key)
- `POST /stripe/checkout` — creates Stripe checkout session
- `POST /stripe/webhook` — handles `checkout.session.completed`, generates license key

#### Schema (D1)
- `licenses` table: id, email, key (unique), plan, active, stripe fields, timestamps
- License key format: `TK-XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX`

#### Deployment
- Secrets: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- Vars: `STRIPE_PRICE_ID`
- `scripts/upload-template.sh` / `.ps1` — packages scaffold and uploads to R2

### Remaining
- Phase 5: ui/tesign overlay (pending @slideup/design)

## Phase 4: COMPLETE — Landing page + email delivery

### Landing page (`crabyard-web/`)
- Astro 5.18.0 + Tailwind CSS v4 (@tailwindcss/vite)
- Dark theme: zinc-950, orange accent, Inter font
- Pages: `index.astro` (full landing), `success.astro` (post-checkout)
- Sections: Nav, Hero with CLI demo, tech logos, 6-card features, 3-step how-it-works, checklist, pricing ($49), FAQ, CTA, footer
- Stripe checkout button → `POST /stripe/checkout` → redirects to Stripe
- Success page fetches `GET /stripe/session/:id` → displays license key + copy button

### API additions
- `POST /stripe/checkout` — creates Stripe checkout session
- `GET /stripe/session/:sessionId` — retrieves license key by Stripe session (for success page)
- CORS middleware: `hono/cors`, origin restricted to `https://crabyard.dev`
- Resend email: sends styled HTML email with license key + quick-start instructions
- New secret: `RESEND_API_KEY` (set via `wrangler secret put`)
- New dep: `resend@6.9.3`

### Remaining
- Phase 5: ui/tesign overlay (pending @slideup/design)
- Deploy: `wrangler deploy` (API), Cloudflare Pages or Vercel (landing page)
- Set Stripe secrets, Resend API key, D1 database ID in wrangler.toml
- Tag v0.2.0 on crabyard-cli repo

## Phase 5: COMPLETE — Documentation + CI/CD + deploy prep

### READMEs
- `crabyard-cli/README.md` — install, usage, flags, template system, license key, development, release
- `crabyard-api/README.md` — stack, endpoints, setup (D1/R2/secrets), deploy

### CI/CD workflows
- `crabyard-api/.github/workflows/deploy.yml` — type check + deploy on push to main (src/ changes)
- `crabyard-web/.github/workflows/deploy.yml` — build + deploy to CF Pages on push to main (src/ changes)
- Both use `oven-sh/setup-bun`, require `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` secrets

### Deploy guide
- `DEPLOY.md` (workspace root) — step-by-step for API, landing page, CLI release, Stripe webhook, DNS
- Install scripts (`install.sh`, `install.ps1`) copied to `crabyard-web/public/` for serving at `crabyard.dev/install.sh`

### Remaining
- Phase 6: ui/tesign overlay (pending @slideup/design)
- Execute deploy steps from DEPLOY.md (requires Cloudflare + Stripe + Resend credentials)
- Tag v0.2.0 on crabyard-cli
