import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/auth-context';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('manager@shiftflow.local');
  const [password, setPassword] = useState('ShiftFlow123!');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (user) return <Navigate to={user.role === 'MANAGER' ? '/dashboard' : '/my-schedule'} replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const authenticatedUser = await login(email, password);
      navigate(authenticatedUser.role === 'MANAGER' ? '/dashboard' : '/my-schedule');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="login-shell"><section className="login-card"><div className="brand">ShiftFlow</div><p className="eyebrow">Workforce operations</p><h1>Welcome back</h1><p className="muted">Sign in to manage your schedule and team.</p><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>{error && <p role="alert" className="form-error">{error}</p>}<button type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</button></form><p className="demo-note">Development login: manager@shiftflow.local / ShiftFlow123!</p></section></main>;
}
