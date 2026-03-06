use serde::Deserialize;

use crate::error::{AppError, AppResult};

#[derive(Deserialize)]
struct GitHubUser {
    login: String,
    avatar_url: String,
}

/// Validate a GitHub token and return (username, avatar_url).
/// Called on startup to restore auth state from a stored token.
pub async fn fetch_github_user(
    http: &reqwest::Client,
    token: &str,
) -> AppResult<(String, String)> {
    let resp = http
        .get("https://api.github.com/user")
        .bearer_auth(token)
        .header("Accept", "application/vnd.github+json")
        .header("X-GitHub-Api-Version", "2022-11-28")
        .send()
        .await?;

    match resp.status().as_u16() {
        200..=299 => {}
        401 => return Err(AppError::TokenExpired),
        code => {
            return Err(AppError::AuthProvider(format!(
                "GitHub API returned HTTP {code}"
            )))
        }
    }

    let user: GitHubUser = resp.json().await?;
    Ok((user.login, user.avatar_url))
}
