use tauri::AppHandle;

use crate::credentials;
use crate::error::AppResult;

pub async fn save(
    app: &AppHandle,
    access_token: &str,
    refresh_token: Option<&str>,
) -> AppResult<()> {
    credentials::save(app, "google", access_token, refresh_token).await
}

pub async fn load(app: &AppHandle) -> AppResult<Option<String>> {
    credentials::load(app, "google").await
}

pub async fn remove(app: &AppHandle) -> AppResult<()> {
    credentials::remove(app, "google").await
}
