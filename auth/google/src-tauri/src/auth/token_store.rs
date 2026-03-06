use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

use crate::error::{AppError, AppResult};

const STORE_FILE: &str = "auth.json";
const TOKEN_KEY: &str = "access_token";
const REFRESH_KEY: &str = "refresh_token";

pub fn save(app: &AppHandle, access_token: &str, refresh_token: Option<&str>) -> AppResult<()> {
    let store = app.store(STORE_FILE)
        .map_err(|e| AppError::Store(e.to_string()))?;
    store.set(TOKEN_KEY, serde_json::Value::String(access_token.to_string()));
    if let Some(rt) = refresh_token {
        store.set(REFRESH_KEY, serde_json::Value::String(rt.to_string()));
    }
    Ok(())
}

pub fn load(app: &AppHandle) -> AppResult<Option<String>> {
    let store = app.store(STORE_FILE)
        .map_err(|e| AppError::Store(e.to_string()))?;
    match store.get(TOKEN_KEY) {
        Some(val) => Ok(val.as_str().map(|s| s.to_string())),
        None => Ok(None),
    }
}

pub fn remove(app: &AppHandle) -> AppResult<()> {
    let store = app.store(STORE_FILE)
        .map_err(|e| AppError::Store(e.to_string()))?;
    store.delete(TOKEN_KEY);
    store.delete(REFRESH_KEY);
    Ok(())
}
