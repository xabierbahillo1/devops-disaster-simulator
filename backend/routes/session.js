const express = require('express');
const router = express.Router();
const { createSession, getSession, removeSession } = require('../lib/data/sessions');
const { startSimulation } = require('../lib/engine/tick');
const { createGame } = require('../lib/data/db');
const { persistFinishedGame } = require('../lib/game/clients');

router.post('/', async (req, res) => {
  const { nickname } = req.body;
  if (!nickname || !nickname.trim()) {
    return res.status(400).json({ success: false, message: 'Nickname requerido' });
  }

  try {
    const trimmed = nickname.trim();
    const key = createSession(trimmed);
    const session = getSession(key);

    const gameId = await createGame(trimmed, key);

    startSimulation(session);
    session.state._gameId = gameId;

    res.json({ success: true, sessionKey: key, nickname: trimmed });
  } catch (err) {
    console.error('[SESSION] Error al crear sesión:', err.message);
    res.status(500).json({ success: false, message: 'Error al crear sesión' });
  }
});

// Salida voluntaria del jugador
router.delete('/', (req, res) => {
  const key = req.headers['x-session-key'];
  if (!key) {
    return res.status(401).json({ success: false, message: 'Falta x-session-key header' });
  }

  const session = getSession(key);
  if (session && session.state) {
    const state = session.state;
    if (state._gameId && !state._gameFinished) {
      persistFinishedGame(state, 'quit');
    }
  }

  removeSession(key);
  res.json({ success: true, message: 'Sesión cerrada' });
});

module.exports = router;
