use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all(serialize = "camelCase"))]
pub struct DeviceCodeResponse {
    pub device_code: String,
    pub user_code: String,
    pub verification_uri: String,
    pub expires_in: u64,
    pub interval: u64,
}

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
