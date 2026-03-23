const express = require('express');
const router = express.Router();
const { createSession, getSession, removeSession } = require('../lib/data/sessions');
const { startSimulation } = require('../lib/engine/tick');
const { createGame } = require('../lib/data/db');
const { persistFinishedGame } = require('../lib/game/clients');

/**
 * @openapi
 * /api/session:
 *   post:
 *     summary: Crear una sesión de juego
 *     description: Crea una nueva sesión e inicia la simulación. Devuelve una sessionKey que debe enviarse como header `x-session-key` en todas las peticiones posteriores.
 *     tags: [Sesión]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nickname]
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: Nombre del jugador
 *                 example: xabi_ops
 *     responses:
 *       200:
 *         description: Sesión creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 sessionKey:
 *                   type: string
 *                   description: Clave de sesión (hex de 32 caracteres)
 *                   example: a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4
 *                 nickname:
 *                   type: string
 *                   example: xabi_ops
 *       400:
 *         description: Nickname vacío o no proporcionado
 *   delete:
 *     summary: Cerrar sesión (salida voluntaria)
 *     description: Cierra la sesión del jugador y marca la partida como terminada con motivo 'quit'. La partida queda registrada en el ranking.
 *     tags: [Sesión]
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Sesión cerrada
 *       401:
 *         description: Sesión no proporcionada o expirada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 */
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
