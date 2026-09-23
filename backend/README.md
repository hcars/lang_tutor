# Lang app backend

The backend is an OAuth 2.0 resource server. It accepts opaque bearer access tokens and validates them with the authorization server's RFC 7662 introspection endpoint. It does not store passwords or access tokens.

## Configuration

Set these environment variables before starting Rocket:

```text
DATABASE_URL=postgres://user:password@localhost/Lang_app
OAUTH_INTROSPECTION_URL=https://issuer.example.com/oauth2/introspect
OAUTH_CLIENT_ID=resource-server-client
OAUTH_CLIENT_SECRET=replace-me
```

`OAUTH_ISSUER` and `OAUTH_AUDIENCE` are optional. When set, the corresponding introspection claims are required to match. The introspection endpoint must return `active: true` and a non-empty `sub` claim. `email`, `username`, `iss`, `aud`, and `exp` are supported when provided.

On startup, the backend connects to PostgreSQL and applies SQLx migrations. `/api/health` is public; all other API routes require `Authorization: Bearer <access-token>`.

## Run and test

```bash
cargo run --manifest-path backend/Cargo.toml
cargo test --manifest-path backend/Cargo.toml
```

The frontend must forward its OAuth access token when calling `/api/parse`.
