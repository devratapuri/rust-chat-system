import './styles/global.css';
import { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import { apiService } from './services/api';
import { wsService } from './services/websocket';
import type { ChatMessage } from './services/websocket';

function NavBar() {
  const location = useLocation();
  const links = [
    { to: '/login', label: 'Login' },
    { to: '/register', label: 'Register' },
    { to: '/chat', label: 'Chat' },
    { to: '/rooms', label: 'Rooms' },
    { to: '/profile', label: 'Profile' },
  ];
  return (
    <nav>
      <div className="nav-inner">
        {links.map(link => (
          <Link key={link.to} to={link.to} className={location.pathname === link.to ? 'active' : ''}>{link.label}</Link>
        ))}
      </div>
    </nav>
  );
}

function Logo() {
  return (
    <div style={{ textAlign: 'center', marginBottom: 18 }}>
      <span style={{ fontSize: 38, color: 'var(--primary)', fontWeight: 700, letterSpacing: '-2px', userSelect: 'none' }}>💬</span>
    </div>
  );
}

function Login() {
  const handleLogin = (email: string, password: string) => {
    // Navigation is handled in LoginForm
  };
  return (
    <div className="main-center">
      <div className="card">
        <div className="accent-bar" />
        <Logo />
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  );
}

function Register() {
  const handleRegister = (email: string, password: string) => {
    // Navigation is handled in RegisterForm
  };
  return (
    <div className="main-center">
      <div className="card">
        <div className="accent-bar" />
        <Logo />
        <RegisterForm onRegister={handleRegister} />
      </div>
    </div>
  );
}

function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ user_id: string; email: string } | null>(null);
  const [error, setError] = useState('');
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = apiService.getToken();
    if (!token) {
      setError('Not authenticated. Please login first.');
      return;
    }

    // Connect to WebSocket
    wsService.connect(token)
      .then(() => {
        setConnected(true);
        setError('');
      })
      .catch((err) => {
        setError(`Connection failed: ${err.message}`);
      });

    // Set up message handlers
    const unsubscribeMessage = wsService.onMessage((message) => {
      setMessages(prev => [...prev, message]);
    });

    const unsubscribeAuth = wsService.onAuth((success, data) => {
      if (success && data) {
        setCurrentUser(data);
      }
    });

    const unsubscribeError = wsService.onError((error) => {
      setError(error);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeAuth();
      unsubscribeError();
      wsService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && connected) {
      try {
        wsService.sendMessage(input);
        setInput('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      }
    }
  };

  if (error) {
    return (
      <div className="card" style={{ padding: 0 }}>
        <div className="accent-bar" />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: 'red' }}>Error</h2>
          <p>{error}</p>
          <Link to="/login" style={{ color: 'var(--primary)' }}>Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="accent-bar" />
      <div style={{ padding: '1.5rem 2rem 1rem 2rem', borderBottom: '1px solid #2222', borderTopLeftRadius: 12, borderTopRightRadius: 12, background: 'var(--accent-gradient)', color: '#fff' }}>
        <Logo />
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: 24, textAlign: 'center' }}>Chat Room</h2>
        {currentUser && (
          <p style={{ margin: '0.5rem 0 0 0', textAlign: 'center', fontSize: 14, opacity: 0.9 }}>
            Connected as {currentUser.email}
          </p>
        )}
        <div style={{ textAlign: 'center', fontSize: 12, marginTop: 4 }}>
          {connected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>
      <div ref={chatBoxRef} style={{ height: 320, overflowY: 'auto', padding: '1rem 2rem', background: 'var(--bg)', borderBottom: '1px solid #2222' }}>
        {messages.length === 0 && <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 80 }}>No messages yet.</div>}
        {messages.map((msg, idx) => {
          const isMyMessage = currentUser && msg.user_id === currentUser.user_id;
          return (
            <div key={idx} style={{ display: 'flex', justifyContent: isMyMessage ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
              {!isMyMessage && <img src={`https://api.dicebear.com/7.x/personas/svg?seed=${msg.user_id}`} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8, alignSelf: 'flex-end' }} />}
              <div style={{ background: isMyMessage ? 'var(--bubble-mine)' : 'var(--bubble-other)', color: isMyMessage ? 'var(--bubble-mine-text)' : 'var(--bubble-other-text)', padding: '8px 16px', borderRadius: 18, maxWidth: '70%', wordBreak: 'break-word', boxShadow: '0 1px 4px #0002', position: 'relative' }}>
                {!isMyMessage && <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 2 }}>{msg.email}</div>}
                {msg.content}
                <span style={{ display: 'block', fontSize: 12, color: isMyMessage ? '#dbeafe' : 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {isMyMessage && <img src={`https://api.dicebear.com/7.x/personas/svg?seed=${msg.user_id}`} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', marginLeft: 8, alignSelf: 'flex-end' }} />}
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, padding: '1rem 2rem', background: 'var(--bg-card)', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span className="input-icon" style={{ left: 14, top: '50%', transform: 'translateY(-50%)' }}>💬</span>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            className="form-input"
            style={{ paddingLeft: 38 }}
            disabled={!connected}
          />
        </div>
        <button type="submit" className="button" disabled={!connected || !input.trim()}>Send</button>
      </form>
    </div>
  );
}

function Profile() {
  return (
    <div className="main-center">
      <div className="card">
        <div className="accent-bar" />
        <Logo />
        <h2 style={{ textAlign: 'center' }}>Profile</h2>
        <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>[Profile management coming soon]</div>
      </div>
    </div>
  );
}

function Rooms() {
  return (
    <div className="main-center">
      <div className="card">
        <div className="accent-bar" />
        <Logo />
        <h2 style={{ textAlign: 'center' }}>Rooms</h2>
        <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>[Room/channel selection coming soon]</div>
      </div>
    </div>
  );
}

function Footer() {
  return <div className="footer">&copy; {new Date().getFullYear()} Rust Chat System &mdash; Modern Chat UI</div>;
}

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
