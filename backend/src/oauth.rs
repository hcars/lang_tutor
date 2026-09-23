use oauth2::basic::BasicClient;
use oauth2::reqwest::async_http_client;
use oauth2::{
    AuthUrl, AuthorizationCode, ClientId, ClientSecret, CsrfToken, PkceCodeChallenge,
    PkceCodeVerifier, RedirectUrl, Scope, TokenResponse, TokenUrl,
};
use rocket::http::{Cookie, CookieJar, SameSite, Status};
use rocket::request::{FromRequest, Outcome, Request};
use rocket::response::Redirect;
use rocket::State;
use serde::Deserialize;

const CSRF_COOKIE: &str = "oauth_csrf";
const PKCE_COOKIE: &str = "oauth_pkce";
const USER_ID_COOKIE: &str = "user_id";

pub struct OAuthClient {
    pub client: BasicClient,
    pub user_info_url: String,
}

impl OAuthClient {
    pub fn from_env() -> Result<Self, String> {
        let client_id = std::env::var("GOOGLE_CLIENT_ID")
            .map_err(|_| "Missing GOOGLE_CLIENT_ID".to_string())?;
        let client_secret = std::env::var("GOOGLE_CLIENT_SECRET")
            .map_err(|_| "Missing GOOGLE_CLIENT_SECRET".to_string())?;
        let redirect_url = std::env::var("GOOGLE_REDIRECT_URL")
            .unwrap_or_else(|_| "http://localhost:8000/auth/callback".to_string());

        let client = BasicClient::new(
            ClientId::new(client_id),
            Some(ClientSecret::new(client_secret)),
            AuthUrl::new("https://accounts.google.com/o/oauth2/v2/auth".to_string())
                .map_err(|_| "Invalid auth URL".to_string())?,
            Some(
                TokenUrl::new("https://oauth2.googleapis.com/token".to_string())
                    .map_err(|_| "Invalid token URL".to_string())?,
            ),
        )
        .set_redirect_uri(
            RedirectUrl::new(redirect_url).map_err(|_| "Invalid redirect URL".to_string())?,
        );

        Ok(OAuthClient {
            client,
            user_info_url: "https://openidconnect.googleapis.com/v1/userinfo".to_string(),
        })
    }
}

#[derive(Debug, Deserialize)]
struct UserInfo {
    sub: String,
}
#[get("/auth/logout")]
pub fn logout(cookies: &CookieJar<'_>) -> Redirect {
    cookies.remove_private(Cookie::from(USER_ID_COOKIE));
    
    let frontend_url = std::env::var("FRONTEND_URL")
        .unwrap_or_else(|_| "http://localhost:5173".to_string());
    
    Redirect::to(frontend_url)
}
#[get("/auth/login")]
pub async fn login(
    oauth_client: &State<OAuthClient>,
    cookies: &CookieJar<'_>,
) -> Result<Redirect, Status> {
    let (pkce_challenge, pkce_verifier) = PkceCodeChallenge::new_random_sha256();

    let (auth_url, csrf_token) = oauth_client
        .client
        .authorize_url(CsrfToken::new_random)
        .add_scope(Scope::new("openid".to_string()))
        .add_scope(Scope::new("profile".to_string()))
        .add_scope(Scope::new("email".to_string()))
        .set_pkce_challenge(pkce_challenge)
        .url();

    let mut csrf_cookie = Cookie::new(CSRF_COOKIE, csrf_token.secret().to_string());
    csrf_cookie.set_path("/");
    csrf_cookie.set_same_site(SameSite::Lax);
    csrf_cookie.set_http_only(true);
    cookies.add_private(csrf_cookie);

    let mut pkce_cookie = Cookie::new(PKCE_COOKIE, pkce_verifier.secret().to_string());
    pkce_cookie.set_path("/");
    pkce_cookie.set_same_site(SameSite::Lax);
    pkce_cookie.set_http_only(true);
    cookies.add_private(pkce_cookie);

    Ok(Redirect::to(auth_url.to_string()))
}


#[get("/auth/callback?<code>&<state>")]
pub async fn callback(
    code: String,
    state: String,
    oauth_client: &State<OAuthClient>,
    cookies: &CookieJar<'_>,
) -> Result<Redirect, Status> {
    let stored_csrf = cookies
        .get_private(CSRF_COOKIE)
        .map(|c| c.value().to_string())
        .ok_or(Status::BadRequest)?;

    let stored_pkce = cookies
        .get_private(PKCE_COOKIE)
        .map(|c| c.value().to_string())
        .ok_or(Status::BadRequest)?;

    cookies.remove_private(Cookie::from(CSRF_COOKIE));
    cookies.remove_private(Cookie::from(PKCE_COOKIE));

    if !constant_time_eq(&stored_csrf, &state) {
        return Err(Status::Unauthorized);
    }

    let pkce_verifier = PkceCodeVerifier::new(stored_pkce);
    let code = AuthorizationCode::new(code);

    let token_result = oauth_client
        .client
        .exchange_code(code)
        .set_pkce_verifier(pkce_verifier)
        .request_async(async_http_client)
        .await
        .map_err(|_| Status::InternalServerError)?;

    let access_token = token_result
        .access_token()
        .secret();

    let user_info: UserInfo = reqwest::Client::new()
        .get(&oauth_client.user_info_url)
        .bearer_auth(access_token)
        .send()
        .await
        .map_err(|_| Status::InternalServerError)?
        .json()
        .await
        .map_err(|_| Status::InternalServerError)?;

    let mut user_cookie = Cookie::new(USER_ID_COOKIE, user_info.sub);
    user_cookie.set_path("/");
    user_cookie.set_same_site(SameSite::Lax);
    user_cookie.set_http_only(true);
    cookies.add_private(user_cookie);

    let frontend_url = std::env::var("FRONTEND_URL")
        .unwrap_or_else(|_| "http://localhost:5173".to_string());

    Ok(Redirect::to(format!("{}/dashboard", frontend_url)))
}

pub struct AuthenticatedUser {
    pub id: String,
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for AuthenticatedUser {
    type Error = ();

    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let cookies = request.cookies();

        match cookies.get_private(USER_ID_COOKIE) {
            Some(cookie) => {
                let user_id = cookie.value().to_string();
                if user_id.is_empty() {
                    Outcome::Error((Status::Unauthorized, ()))
                } else {
                    Outcome::Success(AuthenticatedUser { id: user_id })
                }
            }
            None => Outcome::Error((Status::Unauthorized, ())),
        }
    }
}

fn constant_time_eq(a: &str, b: &str) -> bool {
    if a.len() != b.len() {
        return false;
    }

    let mut result = 0u8;
    for (x, y) in a.bytes().zip(b.bytes()) {
        result |= x ^ y;
    }
    result == 0
}

#[cfg(test)]
mod tests {
    use super::*;
    use rocket::http::Status;
    use rocket::local::asynchronous::Client;

    fn test_rocket() -> rocket::Rocket<rocket::Build> {
        rocket::build()
            .manage(OAuthClient {
                client: BasicClient::new(
                    ClientId::new("test".to_string()),
                    None,
                    AuthUrl::new("https://example.com/auth".to_string()).unwrap(),
                    None,
                ),
                user_info_url: "https://example.com/userinfo".to_string(),
            })
            .mount("/", routes![test_protected_route, logout])
    }

    #[test]
    fn constant_time_eq_returns_true_for_equal_strings() {
        assert!(constant_time_eq("abc123", "abc123"));
        assert!(constant_time_eq("", ""));
        assert!(constant_time_eq(
            "a_very_long_string_with_special_chars!@#$%",
            "a_very_long_string_with_special_chars!@#$%"
        ));
    }

    #[test]
    fn constant_time_eq_returns_false_for_different_strings() {
        assert!(!constant_time_eq("abc123", "abc124"));
        assert!(!constant_time_eq("abc", "abcd"));
        assert!(!constant_time_eq("abc", "xyz"));
        assert!(!constant_time_eq("ABC", "abc"));
    }

    #[test]
    fn constant_time_eq_returns_false_for_different_lengths() {
        assert!(!constant_time_eq("short", "longer_string"));
        assert!(!constant_time_eq("", "a"));
    }

    #[rocket::async_test]
    async fn authenticated_user_returns_error_without_cookie() {
        let client = Client::tracked(test_rocket()).await.unwrap();
        let response = client.get("/protected").dispatch().await;

        assert_eq!(response.status(), Status::Unauthorized);
    }

    #[rocket::async_test]
    async fn authenticated_user_returns_success_with_valid_cookie() {
        let client = Client::untracked(test_rocket()).await.unwrap();

        let response = client
            .get("/protected")
            .private_cookie(Cookie::new(USER_ID_COOKIE, "user-123"))
            .dispatch()
            .await;

        assert_eq!(response.status(), Status::Ok);
    }

    #[rocket::async_test]
    async fn authenticated_user_rejects_empty_user_id() {
        let client = Client::untracked(test_rocket()).await.unwrap();

        let response = client
            .get("/protected")
            .private_cookie(Cookie::new(USER_ID_COOKIE, ""))
            .dispatch()
            .await;

        assert_eq!(response.status(), Status::Unauthorized);
    }

    #[rocket::async_test]
    async fn logout_removes_user_cookie_and_redirects_home() {
        let client = Client::untracked(test_rocket()).await.unwrap();
        client.cookies().add_private(Cookie::new(USER_ID_COOKIE, "user-123"));

        let response = client.get("/auth/logout").dispatch().await;

        assert_eq!(response.status(), Status::SeeOther);
        assert!(client.cookies().get_private(USER_ID_COOKIE).is_none());
    }

    #[get("/protected")]
    fn test_protected_route(_user: AuthenticatedUser) -> &'static str {
        "success"
    }
}
