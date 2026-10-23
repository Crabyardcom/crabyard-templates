use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct AppSettings {
    pub workspace_root: Option<String>,
    pub theme: Option<String>,
    pub launch_at_startup: bool,
}

#[cfg(test)]
mod tests {
    use super::AppSettings;

    #[test]
    fn older_settings_keep_new_fields_at_defaults() {
        let settings: AppSettings = serde_json::from_str(r#"{"workspaceRoot":"/work"}"#).unwrap();
        assert_eq!(settings.workspace_root.as_deref(), Some("/work"));
        assert_eq!(settings.theme, None);
        assert!(!settings.launch_at_startup);
    }

    #[test]
    fn ipc_settings_use_camel_case() {
        let json = serde_json::to_value(AppSettings::default()).unwrap();
        assert!(json.get("workspaceRoot").is_some());
        assert!(json.get("launchAtStartup").is_some());
        assert!(json.get("workspace_root").is_none());
    }
}
