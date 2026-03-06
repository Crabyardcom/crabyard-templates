use serde::{Deserialize, Serialize};

/// Application settings persisted to disk.
/// Add your own fields here as your app grows.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    /// A user-selected workspace or project folder path.
    pub workspace_root: Option<String>,
    /// UI theme preference: "light", "dark", or "system".
    pub theme: Option<String>,
    /// Whether to launch the app minimized on startup.
    pub launch_at_startup: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            workspace_root: None,
            theme: None,
            launch_at_startup: false,
        }
    }
}
