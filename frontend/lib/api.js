const NEXT_PUBLIC_API_URL = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined;
const BASE = NEXT_PUBLIC_API_URL
  ? `${NEXT_PUBLIC_API_URL.replace(/\/+$/, '')}/api`
  : '/api';

function getSessionKey() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('sessionKey');
}

function sessionHeaders() {
  const key = getSessionKey();
  const headers = {};
  if (key) headers['x-session-key'] = key;
  return headers;
}

export async function createSession(nickname) {
  const res = await fetch(`${BASE}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname }),
  });
  return res.json();
}

export async function fetchState() {
  const res = await fetch(`${BASE}/state`, { headers: sessionHeaders() });
  return res.json();
}

export async function sendAction(type, targetId, params) {
  const res = await fetch(`${BASE}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...sessionHeaders() },
    body: JSON.stringify({ type, targetId, params }),
  });
  return res.json();
}

export async function resetSimulation() {
  const res = await fetch(`${BASE}/reset`, { method: 'POST', headers: sessionHeaders() });
  return res.json();
}

export async function unpauseSimulation() {
  const res = await fetch(`${BASE}/unpause`, { method: 'POST', headers: sessionHeaders() });
  return res.json();
}

export async function fetchSSH(serverId) {
  const res = await fetch(`${BASE}/ssh/${serverId}`, { headers: sessionHeaders() });
  return res.json();
}
