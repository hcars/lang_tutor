use std::time::{SystemTime, UNIX_EPOCH};

use rocket::http::Status;
use rocket::request::{FromRequest, Outcome, Request};
use serde::Deserialize;

use crate::models::AccessTokenClaims;

pub struct OAuthToken(pub AccessTokenClaims);

#[derive(Debug, Deserialize)]
struct IntrospectionResponse {
    active: bool,
    sub: Option<String>,
    email: Option<String>,
    username: Option<String>,
    iss: Option<String>,
    exp: Option<i64>,
    aud: Option<serde_json::Value>,
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for OAuthToken {
    type Error = String;

    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let token = match bearer_token(request.headers().get_one("Authorization")) {
            Ok(token) => token,
            Err(error) => return Outcome::Error((Status::Unauthorized, error.to_string())),
        };

        match introspect_token(&token).await {
            Ok(claims) => Outcome::Success(OAuthToken(claims)),
            Err(error) => Outcome::Error((Status::Unauthorized, error)),
        }
    }
}

fn bearer_token(header: Option<&str>) -> Result<String, &'static str> {
    let header = header.ok_or("Missing Authorization header")?;
    let token = header
        .strip_prefix("Bearer ")
        .filter(|token| !token.trim().is_empty())
        .ok_or("Invalid Authorization format")?;
    Ok(token.to_owned())
}

async fn introspect_token(token: &str) -> Result<AccessTokenClaims, String> {
    let endpoint = required_env("OAUTH_INTROSPECTION_URL")?;
    let client_id = required_env("OAUTH_CLIENT_ID")?;
    let client_secret = required_env("OAUTH_CLIENT_SECRET")?;

    let response = reqwest::Client::new()
        .post(endpoint)
        .basic_auth(client_id, Some(client_secret))
        .form(&[("token", token), ("token_type_hint", "access_token")])
        .send()
        .await
        .map_err(|_| "OAuth token introspection failed".to_string())?;

    if !response.status().is_success() {
        return Err("OAuth token introspection failed".to_string());
    }

    let payload: IntrospectionResponse = response
        .json()
        .await
        .map_err(|_| "Invalid OAuth introspection response".to_string())?;

    claims_from_response(payload)
}

fn claims_from_response(payload: IntrospectionResponse) -> Result<AccessTokenClaims, String> {
    if !payload.active {
        return Err("Inactive access token".to_string());
    }
    validate_optional_claims(&payload)?;

    let subject = payload
        .sub
        .filter(|subject| !subject.trim().is_empty())
        .ok_or_else(|| "OAuth introspection response is missing sub".to_string())?;

    Ok(AccessTokenClaims {
        sub: subject,
        email: payload.email,
        username: payload.username,
        issuer: payload.iss,
        expires_at: payload.exp,
    })
}

fn validate_optional_claims(payload: &IntrospectionResponse) -> Result<(), String> {
    if let Some(expected_issuer) = std::env::var_os("OAUTH_ISSUER") {
        if payload.iss.as_deref() != expected_issuer.to_str() {
            return Err("OAuth issuer validation failed".to_string());
        }
    }

    if let Some(expected_audience) = std::env::var_os("OAUTH_AUDIENCE") {
        let expected_audience = expected_audience
            .to_str()
            .ok_or_else(|| "Invalid OAuth audience configuration".to_string())?;
        let matches = match payload.aud.as_ref() {
            Some(serde_json::Value::String(audience)) => audience == expected_audience,
            Some(serde_json::Value::Array(audiences)) => audiences
                .iter()
                .any(|audience| audience.as_str() == Some(expected_audience)),
            _ => false,
        };
        if !matches {
            return Err("OAuth audience validation failed".to_string());
        }
    }

    if let Some(expires_at) = payload.exp {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|_| "System clock is invalid".to_string())?
            .as_secs() as i64;
        if expires_at <= now {
            return Err("Access token has expired".to_string());
        }
    }

    Ok(())
}

fn required_env(name: &str) -> Result<String, String> {
    std::env::var(name).map_err(|_| format!("Missing required OAuth configuration: {name}"))
}

#[cfg(test)]
mod tests {
    use super::{
        bearer_token, claims_from_response, validate_optional_claims, IntrospectionResponse,
    };

    #[test]
    fn bearer_token_requires_a_non_empty_bearer_value() {
        assert_eq!(bearer_token(None), Err("Missing Authorization header"));
        assert_eq!(
            bearer_token(Some("Basic abc")),
            Err("Invalid Authorization format")
        );
        assert_eq!(
            bearer_token(Some("Bearer   ")),
            Err("Invalid Authorization format")
        );
        assert_eq!(bearer_token(Some("Bearer abc")), Ok("abc".to_string()));
    }

    #[test]
    fn inactive_tokens_are_rejected() {
        let response = IntrospectionResponse {
            active: false,
            sub: Some("user-1".to_string()),
            email: None,
            username: None,
            iss: None,
            exp: None,
            aud: None,
        };

        assert!(matches!(
            claims_from_response(response),
            Err(error) if error == "Inactive access token"
        ));
    }

    #[test]
    fn expired_tokens_are_rejected() {
        let response = IntrospectionResponse {
            active: true,
            sub: Some("user-1".to_string()),
            email: None,
            username: None,
            iss: None,
            exp: Some(0),
            aud: None,
        };

        assert!(validate_optional_claims(&response).is_err());
    }
}
