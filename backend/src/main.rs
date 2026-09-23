#[macro_use]
extern crate rocket;

mod auth;
mod db;
mod models;
mod oauth;

use models::{SessionResponse, SessionUser};
use rocket::http::{Method, Status};
use rocket::serde::json::Json;
use rocket_cors::{AllowedOrigins, CorsOptions};
use sqlx::PgPool;



#[get("/api/health")]
fn health() -> &'static str {
    "ok"
}

#[get("/api/auth/session")]
async fn auth_session(
    token: auth::OAuthToken,
    pool: &rocket::State<PgPool>,
) -> Result<Json<SessionResponse>, Status> {
    db::upsert_user(pool, &token.0)
        .await
        .map_err(|_| Status::InternalServerError)?;

    Ok(Json(SessionResponse {
        authenticated: true,
        user: SessionUser {
            subject: token.0.sub,
            email: token.0.email,
        },
    }))
}

#[get("/api/auth/me")]
async fn auth_me(user: oauth::AuthenticatedUser) -> Result<Json<SessionResponse>, Status> {
    Ok(Json(SessionResponse {
        authenticated: true,
        user: SessionUser {
            subject: user.id,
            email: None,
        },
    }))
}

#[get("/")]
fn home(user: oauth::AuthenticatedUser) -> String {
    format!("Welcome, user {}!", user.id)
}

#[launch]
async fn rocket() -> _ {
    dotenvy::dotenv().ok();

    let pool = db::initialize_pool()
        .await
        .expect("Failed to initialize PostgreSQL");
    let cors = CorsOptions {
        allowed_origins: AllowedOrigins::all(),
        allowed_methods: vec![Method::Get, Method::Post, Method::Options]
            .into_iter()
            .map(From::from)
            .collect(),
        allow_credentials: true,
        ..Default::default()
    }
    .to_cors()
    .expect("Failed to create CORS");

    let mut rocket = rocket::build()
        .manage(pool)
        .manage(cors.clone())
        .attach(cors)
        .mount(
            "/",
            routes![health, auth_session, auth_me, home],
        );

    if let Ok(oauth_client) = oauth::OAuthClient::from_env() {
        rocket = rocket
            .manage(oauth_client)
            .mount("/", routes![oauth::login, oauth::callback, oauth::logout]);
    }

    rocket
}
