import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import './AuthPage.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/canvas/new';

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await authService.signInWithGoogle();
      navigate(redirectTo);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        await authService.signUp(email, password, name);
      } else {
        await authService.signIn(email, password);
      }
      navigate(redirectTo);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-root">
      <div className="auth-box">
        <div className="auth-box-logo" onClick={() => navigate('/')}>
          Kite<span>.</span>
        </div>

        {redirectTo !== '/canvas/new' && (
          <div style={{
            background: 'rgba(62,207,92,0.08)', border: '1px solid rgba(62,207,92,0.3)',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '12px',
            fontSize: '11px', color: '#3ecf5c', fontFamily: "'Space Mono', monospace",
            lineHeight: 1.6,
          }}>
            🔗 You were invited to a shared canvas.<br />Sign in to open it.
          </div>
        )}

        <div className="auth-tabs">
          <button
            className={`auth-tab${mode === 'signin' ? ' active' : ''}`}
            onClick={() => setMode('signin')}
          >Sign In</button>
          <button
            className={`auth-tab${mode === 'signup' ? ' active' : ''}`}
            onClick={() => setMode('signup')}
          >Sign Up</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="auth-field">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
          )}
          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Loading…' : mode === 'signup' ? 'Create Account →' : 'Sign In →'}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <button className="auth-google-btn" onClick={handleGoogleSignIn} disabled={loading}>
          <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
            <path d="M44.5 20H24v8.5h11.8C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
            <path d="M6.3 14.7l7 5.1C15.1 16.3 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.5 0-14 4.1-17.7 10.3z" fill="#FF3D00" transform="translate(0,-2.5)"/>
            <path d="M24 45c5.5 0 10.5-1.9 14.3-5.1l-6.6-5.6C29.8 35.9 27 37 24 37c-5.7 0-10.6-3.9-11.8-9.1L5.1 33c3.6 6.5 10.6 12 18.9 12z" fill="#4CAF50" transform="translate(0,2)"/>
            <path d="M44.5 20H24v8.5h11.8c-1 3-3.5 5.5-6.7 7l6.6 5.6C40.3 37.9 45 31.5 45 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default AuthPage;