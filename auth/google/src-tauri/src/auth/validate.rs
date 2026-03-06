use reqwest::Client;
use serde::Deserialize;

use crate::error::{AppError, AppResult};

#[derive(Debug, Deserialize)]
pub struct GoogleUserInfo {
    pub name: Option<String>,
    pub email: String,
    pub picture: Option<String>,
}

pub async fn fetch_google_user(client: &Client, access_token: &str) -> AppResult<GoogleUserInfo> {
    let resp = client
        .get("https://www.googleapis.com/oauth2/v3/userinfo")
        .bearer_auth(access_token)
        .send()
        .await?;

    if resp.status() == reqwest::StatusCode::UNAUTHORIZED {
        return Err(AppError::TokenExpired);
    }

    if !resp.status().is_success() {
        let body = resp.text().await.unwrap_or_default();
        return Err(AppError::AuthProvider(format!("Google API error: {body}")));
    }

    resp.json::<GoogleUserInfo>().await.map_err(Into::into)
}
