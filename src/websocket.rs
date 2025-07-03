use anyhow::Result;
use futures_util::{sink::SinkExt, stream::StreamExt};
use tokio_tungstenite::{accept_async, tungstenite::protocol::Message};
use tokio::net::TcpStream;
use serde::{Deserialize, Serialize};
use crate::db::DBConnection;
use crate::presence::Presence;
use crate::notification::send_push_notification;
use crate::auth::AuthService;

#[derive(Debug, Deserialize)]
#[serde(tag = "type")]
enum ClientMessage {
    #[serde(rename = "auth")]
    Auth { token: String },
    #[serde(rename = "message")]
    ChatMessage { content: String },
}

#[derive(Debug, Serialize)]
#[serde(tag = "type")]
enum ServerMessage {
    #[serde(rename = "auth_success")]
    AuthSuccess { user_id: String, email: String },
    #[serde(rename = "auth_error")]
    AuthError { error: String },
    #[serde(rename = "message")]
    ChatMessage { user_id: String, email: String, content: String, timestamp: String },
    #[serde(rename = "error")]
    Error { error: String },
}

pub async fn handle_connection(
    stream: TcpStream, 
    db: DBConnection, 
    presence: Presence, 
    auth_service: AuthService
) -> Result<()> {
    let ws_stream = accept_async(stream).await?;
    let (mut write, mut read) = ws_stream.split();
    
    let mut authenticated_user: Option<(String, String)> = None; // (user_id, email)

    while let Some(msg) = read.next().await {
        let msg = msg?;

        match msg {
            Message::Text(text) => {
                match serde_json::from_str::<ClientMessage>(&text) {
                    Ok(ClientMessage::Auth { token }) => {
                        match auth_service.verify_token(&token) {
                            Ok(claims) => {
                                authenticated_user = Some((claims.sub.clone(), claims.email.clone()));
                                presence.set_online(&claims.sub);
                                
                                let response = ServerMessage::AuthSuccess {
                                    user_id: claims.sub,
                                    email: claims.email,
                                };
                                
                                let response_text = serde_json::to_string(&response)?;
                                write.send(Message::Text(response_text)).await?;
                            }
                            Err(_) => {
                                let response = ServerMessage::AuthError {
                                    error: "Invalid token".to_string(),
                                };
                                let response_text = serde_json::to_string(&response)?;
                                write.send(Message::Text(response_text)).await?;
                            }
                        }
                    }
                    Ok(ClientMessage::ChatMessage { content }) => {
                        if let Some((user_id, email)) = &authenticated_user {
                            println!("Message from {}: {}", email, content);
                            
                            let msg_id = uuid::Uuid::new_v4().to_string();
                            db.store_message(&msg_id, &format!("{}:{}", user_id, content))?;

                            send_push_notification(
                                "recipient_device_token",
                                "New message",
                                &content,
                            ).await?;

                            let response = ServerMessage::ChatMessage {
                                user_id: user_id.clone(),
                                email: email.clone(),
                                content,
                                timestamp: chrono::Utc::now().to_rfc3339(),
                            };
                            
                            let response_text = serde_json::to_string(&response)?;
                            write.send(Message::Text(response_text)).await?;
                        } else {
                            let response = ServerMessage::Error {
                                error: "Not authenticated".to_string(),
                            };
                            let response_text = serde_json::to_string(&response)?;
                            write.send(Message::Text(response_text)).await?;
                        }
                    }
                    Err(e) => {
                        let response = ServerMessage::Error {
                            error: format!("Invalid message format: {}", e),
                        };
                        let response_text = serde_json::to_string(&response)?;
                        write.send(Message::Text(response_text)).await?;
                    }
                }
            },
            Message::Close(_) => {
                if let Some((user_id, _)) = &authenticated_user {
                    presence.set_offline(user_id);
                }
                println!("Connection closed by client.");
                break;
            },
            _ => {}
        }
    }

    Ok(())
}
