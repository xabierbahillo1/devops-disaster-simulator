const crypto = require('crypto');

const sessions = new Map();

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2h sin actividad -> limpieza

function generateKey() {
  return crypto.randomBytes(16).toString('hex');
}

function createSession(nickname) {
  const key = generateKey();
  sessions.set(key, {
    nickname,
    state: null,       // se asigna en startSimulation
    lastActivity: Date.now(),
    createdAt: Date.now(),
  });
  return key;
}

function getSession(key) {
  const session = sessions.get(key);
  if (!session) return null;
  session.lastActivity = Date.now();
  return session;
}

function removeSession(key) {
  const session = sessions.get(key);
  if (session?.state?.simulationInterval) {
    clearTimeout(session.state.simulationInterval);
  }
  sessions.delete(key);
}

function cleanupStaleSessions() {
  const now = Date.now();
  for (const [key, session] of sessions) {
    if (now - session.lastActivity > SESSION_TTL_MS) {
      removeSession(key);
    }
  }
}

// Limpieza cada 10 minutos
setInterval(cleanupStaleSessions, 10 * 60 * 1000);

function getSessionCount() {
  return sessions.size;
}

module.exports = { createSession, getSession, removeSession, getSessionCount };
