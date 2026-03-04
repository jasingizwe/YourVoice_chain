const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1').replace(/\/$/, '');
const TOKEN_KEY = 'yourvoice_api_token';

export function getApiToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setApiToken(token: string | null) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, withAuth = true): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (withAuth) {
    const token = getApiToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = payload?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return payload as T;
}
