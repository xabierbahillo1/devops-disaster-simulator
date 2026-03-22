const crypto = require('crypto');
const { persistFinishedGame } = require('../game/clients');
const { clearSessionKey, loadActiveSessions } = require('./db');

// Map en memoria como caché rápida (sesión completa con state y tick loop)
const sessions = new Map();

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2h sin actividad -> limpieza

function generateKey() {
  return crypto.randomBytes(16).toString('hex');
}

function createSession(nickname) {
  const key = generateKey();
  sessions.set(key, {
    nickname,
    state: null,
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
  if (!session) return;

  if (session.state?.simulationInterval) {
    clearTimeout(session.state.simulationInterval);
  }

  // Persistir partida si no se había guardado aún
  if (session.state && session.state._gameId && !session.state._gameFinished) {
    persistFinishedGame(session.state, 'timeout');
  }

  // Limpiar session_key en BD
  if (session.state?._gameId) {
    clearSessionKey(session.state._gameId).catch((err) => {
      console.error('[SESSION] Error al limpiar session_key:', err.message);
    });
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

// Restaurar sesiones activas desde BD al reiniciar el backend
async function restoreSessions(resumeSimulationFn) {
  const rows = await loadActiveSessions();
  let restored = 0;

  for (const row of rows) {
    try {
      const session = {
        nickname: row.nickname,
        state: null,
        lastActivity: Date.now(),
        createdAt: Date.now(),
      };

      sessions.set(row.session_key, session);
      resumeSimulationFn(session, row.state_json);
      restored++;
    } catch (err) {
      console.error(`[SESSION] Error restaurando sesión ${row.session_key}:`, err.message);
    }
  }

  if (restored > 0) {
    console.log(`[SESSION] ${restored} sesión(es) restaurada(s) desde BD`);
  }
}

function getSessionCount() {
  return sessions.size;
}

module.exports = { createSession, getSession, removeSession, restoreSessions, getSessionCount };
