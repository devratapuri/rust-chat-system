import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import './App.css';
import { useState } from 'react';

function Login() {
  const handleLogin = (email: string, password: string) => {
    // TODO: Implement login logic (API call)
    alert(`Login: ${email}`);
  };
  return <LoginForm onLogin={handleLogin} />;
}

function Register() {
  const handleRegister = (email: string, password: string) => {
    // TODO: Implement register logic (API call)
    alert(`Register: ${email}`);
  };
  return <RegisterForm onRegister={handleRegister} />;
}

function Chat() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, input]);
      setInput('');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <h2>Chat Room</h2>
      <div style={{ border: '1px solid #ccc', minHeight: 200, padding: 8, marginBottom: 8 }}>
        {messages.length === 0 && <div style={{ color: '#888' }}>No messages yet.</div>}
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: 4 }}>{msg}</div>
        ))}
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1 }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

function Profile() {
  return <div><h2>Profile</h2>{/* TODO: Profile management */}</div>;
}

function Rooms() {
  return <div><h2>Rooms</h2>{/* TODO: Room/channel selection */}</div>;
}

function App() {
  return (
    <Router>
      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/chat">Chat</Link>
        <Link to="/rooms">Rooms</Link>
        <Link to="/profile">Profile</Link>
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
