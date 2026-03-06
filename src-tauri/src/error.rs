use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Not authenticated")]
    NotAuthenticated,

    #[error("Auth provider error: {0}")]
    AuthProvider(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),

    #[error("Token expired or revoked")]
    TokenExpired,

    #[error("Store error: {0}")]
    Store(String),

    #[error("Auth denied by user")]
    AuthDenied,

    #[error("Auth code expired, please try again")]
    AuthExpired,

    #[error("{0}")]
    Other(String),
}

impl Serialize for AppError {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(&self.to_string())
    }
}

pub type AppResult<T> = Result<T, AppError>;
