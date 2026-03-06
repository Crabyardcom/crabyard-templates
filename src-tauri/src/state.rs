use std::sync::Mutex;

pub struct AppState {
    pub auth_token: Option<String>,
    pub username: Option<String>,
    pub avatar_url: Option<String>,
    pub http_client: reqwest::Client,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            auth_token: None,
            username: None,
            avatar_url: None,
            http_client: reqwest::Client::builder()
                .user_agent("{{APP_SLUG}}")
                .build()
                .expect("failed to build http client"),
        }
    }
}

pub type SharedState = Mutex<AppState>;
