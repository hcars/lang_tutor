use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessTokenClaims {
    pub sub: String,
    pub email: Option<String>,
    pub username: Option<String>,
    pub issuer: Option<String>,
    pub expires_at: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct SessionResponse {
    pub authenticated: bool,
    pub user: SessionUser,
}

#[derive(Debug, Serialize)]
pub struct SessionUser {
    pub subject: String,
    pub email: Option<String>,
}
