import { useState } from 'react';

export default function LoginForm({ onLogin }: { onLogin: (email: string, password: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    setError('');
    onLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ marginBottom: 16 }}>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="form-input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="form-input"
      />
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <button type="submit" className="button" style={{ width: '100%' }}>Login</button>
    </form>
  );
} 