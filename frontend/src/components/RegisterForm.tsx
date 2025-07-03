import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

export default function RegisterForm({ onRegister }: { onRegister: (email: string, password: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirm) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.register({ email, password });
      console.log('Registration successful:', response);
      onRegister(email, password);
      navigate('/chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
      <h2 style={{ marginBottom: 16 }}>Register</h2>
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
      <div style={{ position: 'relative' }}>
        <span className="input-icon" style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }}>🔒</span>
        <input
          type={showConfirm ? 'text' : 'password'}
          placeholder="Confirm Password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          className="form-input"
          style={{ paddingLeft: 42, paddingRight: 38 }}
          disabled={loading}
        />
        <span
          className="show-password-toggle"
          onClick={() => setShowConfirm(v => !v)}
          title={showConfirm ? 'Hide password' : 'Show password'}
        >
          {showConfirm ? '🙈' : '👁️'}
        </span>
      </div>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <button type="submit" className="button" style={{ width: '100%' }} disabled={loading}>
        {loading ? 'Creating account...' : 'Register'}
      </button>
    </form>
  );
} 