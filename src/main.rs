mod websocket;
mod db;
mod notification;
mod presence;

use anyhow::Result;
use tokio::net::TcpListener;
use websocket::handle_connection;
use db::DBConnection;
use presence::Presence;

#[tokio::main]
async fn main() -> Result<()> {
    let listener = TcpListener::bind("127.0.0.1:8080").await?;
    let db = DBConnection::new();
    let presence = Presence::new();

    println!("Listening on ws://127.0.0.1:8080");

    loop {
        let (stream, _) = listener.accept().await?;
        let db = db.clone();
        let presence = presence.clone();

        tokio::spawn(async move {
            if let Err(e) = handle_connection(stream, db, presence).await {
                eprintln!("WebSocket Error: {}", e);
            }
        });
    }
}
