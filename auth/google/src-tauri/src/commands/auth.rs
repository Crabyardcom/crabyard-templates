use std::sync::Mutex;

use tauri::{AppHandle, Manager};

use crate::auth::{loopback, token_store, validate};
use crate::error::AppResult;
use crate::models::auth::AuthStatus;
use crate::state::AppState;

#[tauri::command]
pub async fn login(app: AppHandle) -> AppResult<String> {
    let (flow, listener) = loopback::start_auth_flow().await?;
    let auth_url = flow.auth_url.clone();
    let verifier = flow.verifier.clone();
    let state = flow.state.clone();
    let port = flow.port;

    tokio::spawn(async move {
        let code = match loopback::wait_for_callback(listener, &state).await {
            Ok(c) => c,
            Err(e) => {
                eprintln!("OAuth callback error: {e}");
                return;
            }
        };

        let state_mutex = app.state::<Mutex<AppState>>();
        let client = {
            let st = state_mutex.lock().unwrap();
            st.http_client.clone()
        };

        let tokens = match loopback::exchange_code(&client, &code, &verifier, port).await {
            Ok(t) => t,
            Err(e) => {
                eprintln!("Token exchange error: {e}");
                return;
            }
        };

        let user = match validate::fetch_google_user(&client, &tokens.access_token).await {
            Ok(u) => u,
            Err(e) => {
                eprintln!("User info error: {e}");
                return;
            }
        };

        let _ = token_store::save(&app, &tokens.access_token, tokens.refresh_token.as_deref());

        let mut st = state_mutex.lock().unwrap();
        st.auth_token = Some(tokens.access_token);
        st.username = user.name.or(Some(user.email));
        st.avatar_url = user.picture;
    });

    Ok(auth_url)
}

#[tauri::command]
pub async fn get_auth_status(app: AppHandle) -> AppResult<AuthStatus> {
    let state = app.state::<Mutex<AppState>>();
    let st = state.lock().unwrap();
    Ok(AuthStatus {
        authenticated: st.auth_token.is_some(),
        username: st.username.clone(),
        avatar_url: st.avatar_url.clone(),
    })
}

#[tauri::command]
pub async fn restore_auth(app: AppHandle) -> AppResult<AuthStatus> {
    let token = match token_store::load(&app)? {
        Some(t) => t,
        None => return Ok(AuthStatus::unauthenticated()),
    };

    let state = app.state::<Mutex<AppState>>();
    let client = {
        let st = state.lock().unwrap();
        st.http_client.clone()
    };

    match validate::fetch_google_user(&client, &token).await {
        Ok(user) => {
            let mut st = state.lock().unwrap();
            st.auth_token = Some(token);
            st.username = user.name.or(Some(user.email));
            st.avatar_url = user.picture;
            Ok(AuthStatus {
                authenticated: true,
                username: st.username.clone(),
                avatar_url: st.avatar_url.clone(),
            })
        }
        Err(_) => {
            let _ = token_store::remove(&app);
            Ok(AuthStatus::unauthenticated())
        }
    }
}

#[tauri::command]
pub async fn logout(app: AppHandle) -> AppResult<()> {
    token_store::remove(&app)?;
    let state = app.state::<Mutex<AppState>>();
    let mut st = state.lock().unwrap();
    st.auth_token = None;
    st.username = None;
    st.avatar_url = None;
    Ok(())
}
