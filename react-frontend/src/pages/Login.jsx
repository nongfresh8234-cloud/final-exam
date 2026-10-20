import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Brand, Loading, Notice } from '../components/UI';
export default function Login() {
  const { user, loading, login, error: connectionError } = useUser();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    const fields = new FormData(event.currentTarget);
    try { await login(fields.get('identifier'), fields.get('password')); }
    catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  if (loading) return <Loading />;
  if (user) return <Navigate to="/" replace />;
  return <div className="login-page"><section className="login-story"><Brand /><div className="login-message"><span className="eyebrow">ROOM TO GROW</span><h1>Your next chapter<br />starts with a course<span>.</span></h1><p>Discover something new. Build your skills.<br />Learn from people who love what they teach.</p><div className="story-rule" /><span className="story-caption">A space for curious minds.</span></div><span className="story-bottom">LEARN SOMETHING. BECOME SOMETHING.</span></section><section className="login-panel"><div className="login-form"><span className="eyebrow">WELCOME TO COURSE.</span><h2>Good to see you.</h2><p className="muted">Sign in to continue your learning journey.</p><Notice>{error || connectionError}</Notice><form onSubmit={submit}><label>Username or email<input name="identifier" autoComplete="username" placeholder="Enter your username or email" required maxLength={254} /></label><label>Password<input name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required maxLength={72} /></label><button className="button primary full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}<span aria-hidden="true">↗</span></button></form><div className="demo-note"><strong>Try a test account</strong><p>Student: <code>student1</code> · Teacher: <code>teacher1</code></p><p>Password: <code>Learn2026!</code></p></div></div><span className="login-copyright">Online Course Service · 2026</span></section></div>;
}
