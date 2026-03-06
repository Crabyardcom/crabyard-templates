use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

use crate::error::{AppError, AppResult};

const STORE_FILE: &str = "auth.json";
const TOKEN_KEY: &str = "access_token";

pub fn save(app: &AppHandle, token: &str) -> AppResult<()> {
    let store = app
        .store(STORE_FILE)
        .map_err(|e| AppError::Store(e.to_string()))?;
    store.set(TOKEN_KEY, serde_json::Value::String(token.to_string()));
    Ok(())
}

pub fn load(app: &AppHandle) -> AppResult<Option<String>> {
    let store = app
        .store(STORE_FILE)
        .map_err(|e| AppError::Store(e.to_string()))?;
    match store.get(TOKEN_KEY) {
        Some(serde_json::Value::String(s)) => Ok(Some(s.clone())),
        _ => Ok(None),
    }
}

pub fn remove(app: &AppHandle) -> AppResult<()> {
    let store = app
        .store(STORE_FILE)
        .map_err(|e| AppError::Store(e.to_string()))?;
    store.delete(TOKEN_KEY);
    Ok(())
}
