import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

export default function LoginForm({ onLogin }: { onLogin: (email: string, password: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.login({ email, password });
      console.log('Login successful:', response);
      onLogin(email, password);
      navigate('/chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
      <h2 style={{ marginBottom: 16 }}>Login</h2>
      <div style={{ position: 'relative' }}>
        <span className="input-icon" style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }}>📧</span>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="form-input"
          style={{ paddingLeft: 42 }}
          disabled={loading}
        />
      </div>
      <div style={{ position: 'relative' }}>
        <span className="input-icon" style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }}>🔒</span>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="form-input"
          style={{ paddingLeft: 42, paddingRight: 38 }}
          disabled={loading}
        />
        <span
          className="show-password-toggle"
          onClick={() => setShowPassword(v => !v)}
          title={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? '🙈' : '👁️'}
        </span>
      </div>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <button type="submit" className="button" style={{ width: '100%' }} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
} 