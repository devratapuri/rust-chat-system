import { useState } from 'react';

export default function RegisterForm({ onRegister }: { onRegister: (email: string, password: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirm) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    onRegister(email, password);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ marginBottom: 16 }}>Register</h2>
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
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        className="form-input"
      />
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <button type="submit" className="button" style={{ width: '100%' }}>Register</button>
    </form>
  );
} 