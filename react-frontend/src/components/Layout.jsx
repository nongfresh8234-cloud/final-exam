import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Brand, Notice } from './UI';
export default function Layout() {
  const { user, logout } = useUser();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function signOut() {
    setBusy(true); setError('');
    try { await logout(); } catch (error) { setError(error.message); } finally { setBusy(false); }
  }
  return <div className="app-shell"><header className="topbar"><div className="topbar-inner"><Brand /><nav aria-label="Main navigation"><NavLink to="/" end>{user.role === 'Teacher' ? 'My courses' : 'Explore courses'}</NavLink>{user.role === 'Student' && <NavLink to="/enrolled">My learning</NavLink>}</nav><div className="account"><span className="avatar">{user.username.charAt(0).toUpperCase()}</span><div className="account-copy"><strong>{user.username}</strong><span>{user.role}</span></div><button className="text-button signout" onClick={signOut} disabled={busy}>{busy ? 'Signing out…' : 'Sign out'}</button></div></div></header><main className="main"><Notice>{error}</Notice><Outlet /></main><footer className="footer"><span>course. — A little learning goes a long way.</span><span>Online Course Service · 2026</span></footer></div>;
}
