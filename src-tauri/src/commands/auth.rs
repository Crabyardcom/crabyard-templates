use tauri::{AppHandle, Manager, State};

use crate::auth::{device_flow, token_store, validate};
use crate::error::AppResult;
use crate::models::auth::{AuthStatus, DeviceCodeResponse};
use crate::state::SharedState;

#[tauri::command]
pub async fn login(app: AppHandle) -> AppResult<DeviceCodeResponse> {
    let state = app.state::<SharedState>();
    let http = {
        let s = state.lock().unwrap();
        s.http_client.clone()
    };
    device_flow::start_device_flow(&http, "read:user").await
}

#[tauri::command]
pub async fn poll_auth(
    app: AppHandle,
    device_code: String,
    interval: u64,
) -> AppResult<AuthStatus> {
    let state = app.state::<SharedState>();
    let http = {
        let s = state.lock().unwrap();
        s.http_client.clone()
    };

    let token = device_flow::poll_for_token(&http, &device_code, interval).await?;
    let (username, avatar_url) = validate::fetch_github_user(&http, &token).await?;

    token_store::save(&app, &token)?;

    {
        let mut s = state.lock().unwrap();
        s.auth_token = Some(token);
        s.username = Some(username.clone());
        s.avatar_url = Some(avatar_url.clone());
    }

    Ok(AuthStatus {
        authenticated: true,
        username: Some(username),
        avatar_url: Some(avatar_url),
    })
}

#[tauri::command]
pub async fn logout(app: AppHandle) -> AppResult<()> {
    token_store::remove(&app)?;

    let state = app.state::<SharedState>();
    let mut s = state.lock().unwrap();
    s.auth_token = None;
    s.username = None;
    s.avatar_url = None;
    Ok(())
}

#[tauri::command]
pub async fn get_auth_status(state: State<'_, SharedState>) -> AppResult<AuthStatus> {
    let s = state.lock().unwrap();
    Ok(AuthStatus {
        authenticated: s.auth_token.is_some(),
        username: s.username.clone(),
        avatar_url: s.avatar_url.clone(),
    })
}

#[tauri::command]
pub async fn restore_auth(app: AppHandle) -> AppResult<AuthStatus> {
    let token = match token_store::load(&app)? {
        Some(t) if !t.is_empty() => t,
        _ => return Ok(AuthStatus::unauthenticated()),
    };

    let state = app.state::<SharedState>();
    let http = {
        let s = state.lock().unwrap();
        s.http_client.clone()
    };

    match validate::fetch_github_user(&http, &token).await {
        Ok((username, avatar_url)) => {
            let mut s = state.lock().unwrap();
            s.auth_token = Some(token);
            s.username = Some(username.clone());
            s.avatar_url = Some(avatar_url.clone());
            Ok(AuthStatus {
                authenticated: true,
                username: Some(username),
                avatar_url: Some(avatar_url),
            })
        }
        Err(_) => {
            token_store::remove(&app)?;
            Ok(AuthStatus::unauthenticated())
        }
    }
}
