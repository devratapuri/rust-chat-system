mod websocket;
mod db;
mod notification;
mod presence;
mod auth;
mod api;

use anyhow::Result;
use tokio::net::TcpListener;
use websocket::handle_connection;
use db::DBConnection;
use presence::Presence;
use auth::AuthService;
use api::create_router;

#[tokio::main]
async fn main() -> Result<()> {
    let db = DBConnection::new();
    let presence = Presence::new();
    let auth_service = AuthService::new();

    // Start HTTP server for REST APIs
    let app = create_router(auth_service.clone());
    let http_listener = tokio::net::TcpListener::bind("127.0.0.1:3000").await?;
    println!("HTTP Server listening on http://127.0.0.1:3000");
    
    tokio::spawn(async move {
        axum::serve(http_listener, app).await.unwrap();
    });

    // Start WebSocket server
    let ws_listener = TcpListener::bind("127.0.0.1:8080").await?;
    println!("WebSocket Server listening on ws://127.0.0.1:8080");

    loop {
        let (stream, _) = ws_listener.accept().await?;
        let db = db.clone();
        let presence = presence.clone();
        let auth_service = auth_service.clone();

        tokio::spawn(async move {
            if let Err(e) = handle_connection(stream, db, presence, auth_service).await {
                eprintln!("WebSocket Error: {}", e);
            }
        });
    }
}
