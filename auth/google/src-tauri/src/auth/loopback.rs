use rand::Rng;
use reqwest::Client;
use sha2::{Digest, Sha256};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use tokio::net::TcpListener;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use url::Url;

use crate::error::{AppError, AppResult};
use crate::models::auth::GoogleTokenResponse;

fn google_client_id() -> AppResult<String> {
    std::env::var("GOOGLE_CLIENT_ID").map_err(|_| {
        AppError::AuthProvider("GOOGLE_CLIENT_ID not set in .env".into())
    })
}

fn generate_pkce() -> (String, String) {
    let mut rng = rand::rng();
    let verifier: String = (0..128)
        .map(|_| {
            let idx = rng.random_range(0..66);
            b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"[idx] as char
        })
        .collect();
    let hash = Sha256::digest(verifier.as_bytes());
    let challenge = URL_SAFE_NO_PAD.encode(hash);
    (verifier, challenge)
}

fn generate_state() -> String {
    let mut rng = rand::rng();
    (0..32)
        .map(|_| {
            let idx = rng.random_range(0..36);
            b"abcdefghijklmnopqrstuvwxyz0123456789"[idx] as char
        })
        .collect()
}

pub struct AuthFlowResult {
    pub auth_url: String,
    pub verifier: String,
    pub state: String,
    pub port: u16,
}

/// Bind a loopback listener and build the Google OAuth URL.
pub async fn start_auth_flow() -> AppResult<(AuthFlowResult, TcpListener)> {
    let client_id = google_client_id()?;
    let listener = TcpListener::bind("127.0.0.1:0").await
        .map_err(|e| AppError::Other(format!("Failed to bind loopback listener: {e}")))?;
    let port = listener.local_addr()
        .map_err(|e| AppError::Other(e.to_string()))?.port();

    let (verifier, challenge) = generate_pkce();
    let state = generate_state();
    let redirect_uri = format!("http://127.0.0.1:{port}/callback");

    let auth_url = format!(
        "https://accounts.google.com/o/oauth2/v2/auth?\
         client_id={client_id}&\
         redirect_uri={redirect_uri}&\
         response_type=code&\
         scope=openid%20email%20profile&\
         code_challenge={challenge}&\
         code_challenge_method=S256&\
         state={state}&\
         access_type=offline&\
         prompt=consent"
    );

    Ok((
        AuthFlowResult { auth_url, verifier, state, port },
        listener,
    ))
}

/// Wait for the OAuth callback on the loopback listener.
/// Returns the authorization code.
pub async fn wait_for_callback(
    listener: TcpListener,
    expected_state: &str,
) -> AppResult<String> {
    let (mut stream, _) = listener.accept().await
        .map_err(|e| AppError::Other(format!("Loopback accept failed: {e}")))?;

    let mut reader = BufReader::new(&mut stream);
    let mut request_line = String::new();
    reader.read_line(&mut request_line).await
        .map_err(|e| AppError::Other(e.to_string()))?;

    // Parse GET /callback?code=...&state=... HTTP/1.1
    let path = request_line
        .split_whitespace()
        .nth(1)
        .ok_or_else(|| AppError::Other("Invalid HTTP request".into()))?;

    let url = Url::parse(&format!("http://127.0.0.1{path}"))
        .map_err(|e| AppError::Other(format!("Failed to parse callback URL: {e}")))?;

    let params: std::collections::HashMap<_, _> = url.query_pairs().collect();

    // Send response before validating — the browser needs a page
    let html = "<html><body><h3>Authentication successful</h3><p>You can close this tab.</p></body></html>";
    let response = format!(
        "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
        html.len(),
        html
    );

    // Get writable half — drop reader first
    drop(reader);
    stream.write_all(response.as_bytes()).await
        .map_err(|e| AppError::Other(e.to_string()))?;
    stream.shutdown().await
        .map_err(|e| AppError::Other(e.to_string()))?;

    if let Some(error) = params.get("error") {
        return Err(AppError::AuthProvider(format!("Google auth error: {error}")));
    }

    let state = params.get("state")
        .ok_or_else(|| AppError::Other("Missing state parameter".into()))?;
    if state.as_ref() != expected_state {
        return Err(AppError::Other("State mismatch — possible CSRF".into()));
    }

    let code = params.get("code")
        .ok_or_else(|| AppError::Other("Missing authorization code".into()))?;

    Ok(code.to_string())
}

/// Exchange the authorization code for tokens.
pub async fn exchange_code(
    client: &Client,
    code: &str,
    verifier: &str,
    port: u16,
) -> AppResult<GoogleTokenResponse> {
    let client_id = google_client_id()?;
    let redirect_uri = format!("http://127.0.0.1:{port}/callback");

    let resp = client
        .post("https://oauth2.googleapis.com/token")
        .form(&[
            ("code", code),
            ("client_id", &client_id),
            ("redirect_uri", &redirect_uri),
            ("grant_type", "authorization_code"),
            ("code_verifier", verifier),
        ])
        .send()
        .await?;

    if !resp.status().is_success() {
        let body = resp.text().await.unwrap_or_default();
        return Err(AppError::AuthProvider(format!("Token exchange failed: {body}")));
    }

    resp.json::<GoogleTokenResponse>().await.map_err(Into::into)
}
