# Application architecture

The React webview owns presentation. Tauri owns native operations, settings persistence, authentication, and application lifecycle. `src/lib/tauri.ts` provides the typed IPC boundary; its `CommandMap` must match registered Rust commands and models in `src-tauri/src/`.

| Area | Location | Change here for |
| --- | --- | --- |
| Product workspace | `src/components/DashboardView.tsx` | Screens and user flows |
| Native command API | `src/lib/tauri.ts` | Typed frontend/backend calls |
| Shared models | `src/lib/types.ts`, `src-tauri/src/models/` | IPC payloads |
| Shared state | `src/store/appStore.ts` | State used across screens |
| Preferences | `src/hooks/useSettings.ts` | Settings load/save and folder selection |
| Native window shell | `src/components/TitleBar.tsx` | Window controls and theme menu |
| Native startup | `src-tauri/src/lib.rs` | Plugins, menus, command registration |
| Permissions and CSP | `src-tauri/capabilities/`, `src-tauri/tauri.conf.json` | Native grants and allowed resources |
| Startup splash | `public/splash.html` | Asset included in development and production |

Settings use the Rust store plugin and explicit saves. Models use serde defaults so adding a preference does not erase older users' settings. Folder dialogs await a oneshot channel without blocking the async runtime.

Authentication is `{{AUTH_MODULE}}`. With `none`, auth modules and login state are absent. GitHub uses device authorization; Google uses a loopback listener with PKCE. Review credential storage and provider configuration before distributing an auth-enabled app.

UI is `{{UI_MODULE}}`. Components share a small interface across overlays but are not interchangeable with every upstream library API. Inspect local exports before using a primitive.

Auto-update integration is installed but disabled. Production builds work without update signing credentials; enable updates only after following `PRODUCTION.md`.
