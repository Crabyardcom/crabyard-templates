use tauri::AppHandle;

use crate::credentials;
use crate::error::AppResult;

pub async fn save(app: &AppHandle, token: &str) -> AppResult<()> {
    credentials::save(app, "github", token, None).await
}

pub async fn load(app: &AppHandle) -> AppResult<Option<String>> {
    credentials::load(app, "github").await
}

pub async fn remove(app: &AppHandle) -> AppResult<()> {
    credentials::remove(app, "github").await
}
