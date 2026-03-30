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
  if (!res.ok) {
    const err = new Error('Session error');
    err.status = res.status;
    throw err;
  }
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

export async function endSession() {
  const res = await fetch(`${BASE}/session`, { method: 'DELETE', headers: sessionHeaders() });
  return res.json();
}

export async function sendChatMessage(message, chatHistory, gameContext) {
  const res = await fetch(`${BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...sessionHeaders() },
    body: JSON.stringify({ message, chatHistory, gameContext }),
  });
  return res.json();
}

export async function fetchRanking({ page = 1, search = '' } = {}) {
  const params = new URLSearchParams({ page });
  if (search.trim()) params.set('search', search.trim());
  const res = await fetch(`${BASE}/ranking?${params}`);
  return res.json();
}

export async function fetchReviews({ page = 1, filter = 'all' } = {}) {
  const params = new URLSearchParams({ page, filter });
  const res = await fetch(`${BASE}/review?${params}`);
  return res.json();
}

export async function checkCanReview() {
  const res = await fetch(`${BASE}/review/can-review`);
  return res.json();
}

export async function submitReview({ sessionId, nickname, recommended, comment }) {
  const res = await fetch(`${BASE}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, nickname, recommended, comment }),
  });
  return res.json();
}
