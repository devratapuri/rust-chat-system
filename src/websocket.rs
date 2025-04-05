use anyhow::Result;
use futures_util::{sink::SinkExt, stream::StreamExt};
use tokio_tungstenite::{accept_async, tungstenite::protocol::Message};
use tokio::net::TcpStream;
use crate::db::DBConnection;
use crate::presence::Presence;
use crate::notification::send_push_notification;

pub async fn handle_connection(stream: TcpStream, db: DBConnection, presence: Presence) -> Result<()> {
    let ws_stream = accept_async(stream).await?;
    let (mut write, mut read) = ws_stream.split();

    while let Some(msg) = read.next().await {
        let msg = msg?;

        match msg {
            Message::Text(text) => {
                println!("Received message: {}", &text);
                let msg_id = uuid::Uuid::new_v4().to_string();
                db.store_message(&msg_id, &text)?;

                send_push_notification(
                    "recipient_device_token",
                    "New message",
                    &text,
                ).await?;

                write.send(Message::Text(format!("Echo: {}", text))).await?;
            },
            Message::Close(_) => {
                println!("Connection closed by client.");
                break;
            },
            _ => {}
        }
    }

    Ok(())
}
