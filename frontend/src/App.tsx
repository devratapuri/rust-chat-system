import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import './App.css';
import './styles/global.css';
import { useState, useRef, useEffect } from 'react';

function NavBar() {
  return (
    <nav style={{ background: '#fff', boxShadow: '0 2px 8px #0001', padding: '0.5rem 0', marginBottom: '2rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'center' }}>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/chat">Chat</Link>
        <Link to="/rooms">Rooms</Link>
        <Link to="/profile">Profile</Link>
      </div>
    </nav>
  );
}

function Login() {
  const handleLogin = (email: string, password: string) => {
    // TODO: Implement login logic (API call)
    alert(`Login: ${email}`);
  };
  return <div className="card"><LoginForm onLogin={handleLogin} /></div>;
}

function Register() {
  const handleRegister = (email: string, password: string) => {
    // TODO: Implement register logic (API call)
    alert(`Register: ${email}`);
  };
  return <div className="card"><RegisterForm onRegister={handleRegister} /></div>;
}

function Chat() {
  const [messages, setMessages] = useState<{text: string, time: string, mine: boolean}[]>([]);
  const [input, setInput] = useState('');
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, {
        text: input,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mine: messages.length % 2 === 0 // alternate for demo
      }]);
      setInput('');
    }
  };

  return (
    <div className="card" style={{ padding: 0 }}>
      <div style={{ padding: '1.5rem 2rem 1rem 2rem', borderBottom: '1px solid #eee', borderTopLeftRadius: 12, borderTopRightRadius: 12, background: 'linear-gradient(90deg, #4f8cff 0%, #6fc3ff 100%)', color: '#fff' }}>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: 24 }}>💬 Chat Room</h2>
      </div>
      <div ref={chatBoxRef} style={{ height: 320, overflowY: 'auto', padding: '1rem 2rem', background: '#f7f9fa', borderBottom: '1px solid #eee' }}>
        {messages.length === 0 && <div style={{ color: '#aaa', textAlign: 'center', marginTop: 80 }}>No messages yet.</div>}
        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: msg.mine ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
            {!msg.mine && <img src={`https://api.dicebear.com/7.x/personas/svg?seed=other${idx}`} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8, alignSelf: 'flex-end' }} />}
            <div style={{ background: msg.mine ? '#4f8cff' : '#e0e7ff', color: msg.mine ? '#fff' : '#222', padding: '8px 16px', borderRadius: 18, maxWidth: '70%', wordBreak: 'break-word', boxShadow: '0 1px 4px #0002', position: 'relative' }}>
              {msg.text}
              <span style={{ display: 'block', fontSize: 12, color: msg.mine ? '#dbeafe' : '#888', marginTop: 4, textAlign: 'right' }}>{msg.time}</span>
            </div>
            {msg.mine && <img src={`https://api.dicebear.com/7.x/personas/svg?seed=me`} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', marginLeft: 8, alignSelf: 'flex-end' }} />}
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, padding: '1rem 2rem', background: '#fff', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          className="form-input"
        />
        <button type="submit" className="button">Send</button>
      </form>
    </div>
  );
}

function Profile() {
  return <div className="card"><h2>Profile</h2><div style={{ color: '#888' }}>[Profile management coming soon]</div></div>;
}

function Rooms() {
  return <div className="card"><h2>Rooms</h2><div style={{ color: '#888' }}>[Room/channel selection coming soon]</div></div>;
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
    </Router>
  );
}

export default App;
