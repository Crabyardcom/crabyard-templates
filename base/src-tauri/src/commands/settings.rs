use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_store::StoreExt;

use crate::error::{AppError, AppResult};
use crate::models::settings::AppSettings;

const STORE_FILE: &str = "settings.json";
const SETTINGS_KEY: &str = "app_settings";

pub fn load_settings(app: &AppHandle) -> AppResult<AppSettings> {
    let store = app
        .store(STORE_FILE)
        .map_err(|e| AppError::Other(e.to_string()))?;
    match store.get(SETTINGS_KEY) {
        Some(val) => {
            let settings: AppSettings =
                serde_json::from_value(val).unwrap_or_default();
            Ok(settings)
        }
        None => Ok(AppSettings::default()),
    }
}

pub fn save_settings(app: &AppHandle, settings: &AppSettings) -> AppResult<()> {
    let store = app
        .store(STORE_FILE)
        .map_err(|e| AppError::Other(e.to_string()))?;
    let val = serde_json::to_value(settings)
        .map_err(|e| AppError::Other(e.to_string()))?;
    store.set(SETTINGS_KEY, val);
    Ok(())
}

#[tauri::command]
pub async fn get_settings(app: AppHandle) -> AppResult<AppSettings> {
    load_settings(&app)
}

#[tauri::command]
pub async fn set_settings(app: AppHandle, settings: AppSettings) -> AppResult<()> {
    save_settings(&app, &settings)
}

#[tauri::command]
pub async fn select_workspace_folder(app: AppHandle) -> AppResult<Option<String>> {
    let (tx, rx) = std::sync::mpsc::channel();
    app.dialog()
        .file()
        .set_title("Select Workspace Folder")
        .pick_folder(move |folder| {
            let path = folder.map(|f| f.to_string());
            let _ = tx.send(path);
        });
    let result = rx
        .recv()
        .map_err(|_| AppError::Other("Dialog cancelled".into()))?;
    Ok(result)
}
