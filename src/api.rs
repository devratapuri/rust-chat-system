use axum::{
    extract::{State, Query},
    http::{StatusCode, HeaderMap},
    Json, Router,
    routing::{get, post},
    middleware::{self, Next},
    response::{IntoResponse, Response},
};
use serde_json::json;
use std::sync::Arc;
use tower_http::cors::{CorsLayer, Any};

use crate::auth::{AuthService, LoginRequest, RegisterRequest, Claims};

pub type AppState = Arc<AuthService>;

pub fn create_router(auth_service: AuthService) -> Router {
    let state = Arc::new(auth_service);
    
    Router::new()
        .route("/api/auth/register", post(register))
        .route("/api/auth/login", post(login))
        .route("/api/auth/me", get(get_current_user))
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any)
        )
        .with_state(state)
}

async fn register(
    State(auth_service): State<AppState>,
    Json(req): Json<RegisterRequest>,
) -> impl IntoResponse {
    match auth_service.register(req) {
        Ok(response) => (StatusCode::CREATED, Json(json!(response))),
        Err(e) => (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": e.to_string() }))
        ),
    }
}

async fn login(
    State(auth_service): State<AppState>,
    Json(req): Json<LoginRequest>,
) -> impl IntoResponse {
    match auth_service.login(req) {
        Ok(response) => (StatusCode::OK, Json(json!(response))),
        Err(e) => (
            StatusCode::UNAUTHORIZED,
            Json(json!({ "error": e.to_string() }))
        ),
    }
}

async fn get_current_user(
    State(auth_service): State<AppState>,
    headers: HeaderMap,
) -> impl IntoResponse {
    let auth_header = headers.get("authorization");
    
    let token = match auth_header.and_then(|h| h.to_str().ok()) {
        Some(auth) if auth.starts_with("Bearer ") => &auth[7..],
        _ => {
            return (
                StatusCode::UNAUTHORIZED,
                Json(json!({ "error": "Missing or invalid authorization header" }))
            );
        }
    };

    match auth_service.verify_token(token) {
        Ok(claims) => {
            if let Some(user) = auth_service.get_user_by_id(&claims.sub) {
                (StatusCode::OK, Json(json!({
                    "id": user.id,
                    "email": user.email
                })))
            } else {
                (
                    StatusCode::NOT_FOUND,
                    Json(json!({ "error": "User not found" }))
                )
            }
        }
        Err(e) => (
            StatusCode::UNAUTHORIZED,
            Json(json!({ "error": e.to_string() }))
        ),
    }
}

// Middleware for JWT authentication
pub async fn auth_middleware(
    State(auth_service): State<AppState>,
    mut req: axum::extract::Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let auth_header = req.headers().get("authorization");
    
    let token = match auth_header.and_then(|h| h.to_str().ok()) {
        Some(auth) if auth.starts_with("Bearer ") => &auth[7..],
        _ => return Err(StatusCode::UNAUTHORIZED),
    };

    match auth_service.verify_token(token) {
        Ok(claims) => {
            req.extensions_mut().insert(claims);
            Ok(next.run(req).await)
        }
        Err(_) => Err(StatusCode::UNAUTHORIZED),
    }
} 