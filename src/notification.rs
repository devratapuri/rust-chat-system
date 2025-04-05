use reqwest::Client;
use serde::Serialize;
use anyhow::Result;

#[derive(Serialize)]
struct FCMMessage<'a> {
    to: &'a str,
    notification: FCMNotification<'a>,
}

#[derive(Serialize)]
struct FCMNotification<'a> {
    title: &'a str,
    body: &'a str,
}

pub async fn send_push_notification(to: &str, title: &str, body: &str) -> Result<()> {
    let client = Client::new();
    let message = FCMMessage {
        to,
        notification: FCMNotification { title, body },
    };

    let res = client
        .post("https://fcm.googleapis.com/fcm/send")
        .header("Authorization", "key=YOUR_SERVER_KEY")
        .header("Content-Type", "application/json")
        .json(&message)
        .send()
        .await?;

    println!("Notification sent: {:?}", res.status());
    Ok(())
}
