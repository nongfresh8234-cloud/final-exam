const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const tokenKey = 'course-session-v1';
export const sessionToken = {
  get: () => sessionStorage.getItem(tokenKey),
  set: (token) => sessionStorage.setItem(tokenKey, token),
  clear: () => sessionStorage.removeItem(tokenKey),
};
export async function api(path, options = {}) {
  const token = sessionToken.get();
  let response;
  try {
    response = await fetch(`${base}/api${path}`, {
      ...options, credentials: 'include',
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Cannot connect to the server. Check that the backend is running.', { cause: error });
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') {
      sessionToken.clear();
      window.dispatchEvent(new Event('session-expired'));
    }
    const error = new Error(data.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}
export const money = (amount) => new Intl.NumberFormat('en-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 2 }).format(amount);
