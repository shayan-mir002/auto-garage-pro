// MongoDB-backed auth via API — session stays in localStorage for client-side state

const API_BASE = '/api/auth';
const SESSION_KEY = 'auth_session';

async function safeJson(res) {
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export async function signUp({ email, password, full_name }) {
  const res = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Signup failed');
  setSession({ user: data.user });
  return data;
}

export async function signIn({ email, password }) {
  const res = await fetch(`${API_BASE}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Sign in failed');
  setSession({ user: data.user });
  return data;
}

export function signOut() {
  clearSession();
}

export async function getProfile(userId) {
  const res = await fetch(`${API_BASE}/profile/${userId}`);
  return safeJson(res);
}

export async function updateProfile(userId, updates) {
  const res = await fetch(`${API_BASE}/profile/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return safeJson(res);
}

export async function getAllUsers() {
  const res = await fetch(`${API_BASE}/users`);
  return (await safeJson(res)) || [];
}
