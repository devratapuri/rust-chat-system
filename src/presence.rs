use tokio::sync::broadcast;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

#[derive(Clone)]
pub struct Presence {
    user_status: Arc<Mutex<HashMap<String, bool>>>,
    sender: broadcast::Sender<String>,
}

impl Presence {
    pub fn new() -> Self {
        let (sender, _) = broadcast::channel(100);
        Presence {
            user_status: Arc::new(Mutex::new(HashMap::new())),
            sender,
        }
    }

    pub fn set_online(&self, user_id: &str) {
        let mut status = self.user_status.lock().unwrap();
        status.insert(user_id.to_string(), true);
        let _ = self.sender.send(format!("{} is online", user_id));
    }

    pub fn set_offline(&self, user_id: &str) {
        let mut status = self.user_status.lock().unwrap();
        status.insert(user_id.to_string(), false);
        let _ = self.sender.send(format!("{} is offline", user_id));
    }

    pub fn get_status(&self, user_id: &str) -> Option<bool> {
        let status = self.user_status.lock().unwrap();
        status.get(user_id).copied()
    }
}
