use sqlx::{postgres::PgPoolOptions, PgPool};

use crate::models::AccessTokenClaims;

pub async fn initialize_pool() -> Result<PgPool, String> {
    let database_url = std::env::var("DATABASE_URL")
        .map_err(|_| "Missing required database configuration: DATABASE_URL".to_string())?;
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .map_err(|_| "Failed to connect to PostgreSQL".to_string())?;

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .map_err(|_| "Failed to run PostgreSQL migrations".to_string())?;

    Ok(pool)
}

pub async fn upsert_user(pool: &PgPool, claims: &AccessTokenClaims) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO users (subject, email) VALUES ($1, $2)
         ON CONFLICT (subject) DO UPDATE SET email = EXCLUDED.email, updated_at = NOW()",
    )
    .bind(&claims.sub)
    .bind(&claims.email)
    .execute(pool)
    .await
    .map(|_| ())
}
