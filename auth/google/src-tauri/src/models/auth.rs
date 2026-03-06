use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthStatus {
    pub authenticated: bool,
    pub username: Option<String>,
    pub avatar_url: Option<String>,
}

impl AuthStatus {
    pub fn unauthenticated() -> Self {
        Self {
            authenticated: false,
            username: None,
            avatar_url: None,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct GoogleTokenResponse {
    pub access_token: String,
    pub refresh_token: Option<String>,
}
