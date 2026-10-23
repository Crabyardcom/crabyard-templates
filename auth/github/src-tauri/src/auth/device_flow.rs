use serde::Deserialize;

use crate::error::{AppError, AppResult};
use crate::models::auth::DeviceCodeResponse;

const DEVICE_CODE_URL: &str = "https://github.com/login/device/code";
const ACCESS_TOKEN_URL: &str = "https://github.com/login/oauth/access_token";

fn github_client_id() -> AppResult<String> {
    let runtime = std::env::var("GITHUB_CLIENT_ID").ok();
    crate::public_config::oauth_client_id(runtime.as_deref(), option_env!("GITHUB_CLIENT_ID"))
        .ok_or_else(|| {
            AppError::AuthProvider(
                "Configure a GitHub OAuth public client ID before signing in".into(),
            )
        })
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

        if let Some(token) = body.access_token
            && !token.is_empty()
        {
            return Ok(token);
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
