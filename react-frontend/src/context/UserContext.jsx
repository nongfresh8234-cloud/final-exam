/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { api, sessionToken } from '../lib/api';
export const UserContext = createContext(null);
export const useUser = () => useContext(UserContext);
export function UserProvider({ children }) {
  const [state, setState] = useState({ user: null, loading: true, error: '' });
  useEffect(() => {
    let active = true;
    const expire = () => setState({ user: null, loading: false, error: '' });
    window.addEventListener('session-expired', expire);
    api('/user').then(({ user }) => {
      if (active) setState({ user, loading: false, error: '' });
    }).catch((error) => {
      if (active) setState({ user: null, loading: false, error: error.status === 401 ? '' : error.message });
    });
    return () => { active = false; window.removeEventListener('session-expired', expire); };
  }, []);
  async function login(identifier, password) {
    const { user, token } = await api('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) });
    sessionToken.set(token);
    setState({ user, loading: false, error: '' });
  }
  async function logout() {
    await api('/auth/logout', { method: 'POST' });
    sessionToken.clear();
    setState({ user: null, loading: false, error: '' });
  }
  return <UserContext.Provider value={{ ...state, login, logout }}>{children}</UserContext.Provider>;
}
