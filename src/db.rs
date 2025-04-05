use rocksdb::DB;
use anyhow::Result;
use std::sync::Arc;

#[derive(Clone)]
pub struct DBConnection {
    db: Arc<DB>,
}

impl DBConnection {
    pub fn new() -> Self {
        let path = "chat_messages";
        let db = Arc::new(DB::open_default(path).unwrap());
        DBConnection { db }
    }

    pub fn store_message(&self, message_id: &str, message: &str) -> Result<()> {
        self.db.put(message_id, message)?;
        Ok(())
    }

    pub fn retrieve_message(&self, message_id: &str) -> Result<Option<String>> {
        match self.db.get(message_id)? {
            Some(value) => Ok(Some(String::from_utf8(value)?)),
            None => Ok(None),
        }
    }
}
