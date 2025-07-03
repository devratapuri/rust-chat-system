# Rust Chat System

A simple, asynchronous WebSocket chat server written in Rust.

## Features

- Asynchronous networking using [Tokio](https://tokio.rs/)
- Modular design: database, notifications, presence, and WebSocket handling
- Per-connection state management
- Error handling with [anyhow](https://docs.rs/anyhow/)

## Getting Started

### Prerequisites

- Rust (latest stable recommended)
- Cargo

### Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/rust-chat-system.git
cd rust-chat-system
```

Install dependencies:

```bash
cargo build
```

### Running the Server

Start the WebSocket server:

```bash
cargo run
```

The server will listen on `ws://127.0.0.1:8080`.

### Project Structure

- `src/main.rs`: Application entry point, sets up the TCP listener and spawns tasks for each connection.
- `src/websocket.rs`: Handles WebSocket connections and messaging.
- `src/db.rs`: Database connection and operations.
- `src/notification.rs`: Notification logic (details depend on implementation).
- `src/presence.rs`: Manages user presence (online/offline status).

### Usage

Connect to the server using any WebSocket client (e.g., browser, `wscat`, etc.):

```bash
wscat -c ws://127.0.0.1:8080
```

### Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

### License

[MIT](LICENSE)

---

## Notes

- The actual chat logic, message format, and database schema are defined in the respective modules.
- For more details, see the source code in the `src/` directory. 