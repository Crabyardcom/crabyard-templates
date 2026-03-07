use serde::Deserialize;

use crate::error::{AppError, AppResult};
use crate::models::auth::DeviceCodeResponse;

// GitHub Device Flow endpoints
const DEVICE_CODE_URL: &str = "https://github.com/login/device/code";
const ACCESS_TOKEN_URL: &str = "https://github.com/login/oauth/access_token";

/// Returns the GitHub OAuth Client ID from the environment.
/// Set GITHUB_CLIENT_ID in your .env file (development) or system environment (production).
/// Create a GitHub OAuth App at: https://github.com/settings/developers
fn github_client_id() -> AppResult<String> {
    let id = std::env::var("GITHUB_CLIENT_ID").unwrap_or_default();
    if id.is_empty() || id.starts_with("your_") {
        return Err(AppError::Other(
            "GITHUB_CLIENT_ID is not configured. \
             Create a GitHub OAuth App at https://github.com/settings/developers \
             and set the Client ID in your .env file."
                .into(),
        ));
    }
    Ok(id)
}

pub async fn start_device_flow(
    http: &reqwest::Client,
    scope: &str,
) -> AppResult<DeviceCodeResponse> {
    let client_id = github_client_id()?;

    let resp = http
        .post(DEVICE_CODE_URL)
        .header("Accept", "application/json")
        .json(&serde_json::json!({
            "client_id": client_id,
            "scope": scope
        }))
        .send()
        .await?;

    if !resp.status().is_success() {
        let text = resp.text().await.unwrap_or_default();
        return Err(AppError::AuthProvider(format!(
            "Device flow request failed: {text}"
        )));
    }

    let body: DeviceCodeResponse = resp.json().await?;
    Ok(body)
}

#[derive(Deserialize)]
struct TokenResponse {
    access_token: Option<String>,
    error: Option<String>,
    interval: Option<u64>,
}

/// Poll GitHub until the user authorizes the device or the code expires.
/// Returns the access token on success.
pub async fn poll_for_token(
    http: &reqwest::Client,
    device_code: &str,
    mut interval: u64,
) -> AppResult<String> {
    let client_id = github_client_id()?;
    loop {
        tokio::time::sleep(std::time::Duration::from_secs(interval)).await;

        let resp = http
            .post(ACCESS_TOKEN_URL)
            .header("Accept", "application/json")
            .json(&serde_json::json!({
                "client_id": client_id,
                "device_code": device_code,
                "grant_type": "urn:ietf:params:oauth:grant-type:device_code"
            }))
            .send()
            .await?;

        let body: TokenResponse = resp.json().await?;

        if let Some(token) = body.access_token {
            if !token.is_empty() {
                return Ok(token);
            }
        }

        match body.error.as_deref() {
            Some("authorization_pending") => continue,
            Some("slow_down") => {
                interval = body.interval.unwrap_or(interval + 5);
                continue;
            }
            Some("expired_token") => return Err(AppError::AuthExpired),
            Some("access_denied") => return Err(AppError::AuthDenied),
            Some(e) => return Err(AppError::AuthProvider(format!("OAuth error: {e}"))),
            None => return Err(AppError::AuthProvider("Unknown OAuth response".into())),
        }
    }
}
