const express = require('express');
const router  = express.Router();
const { requireSession } = require('../middleware/session');
const { getCurrentState } = require('../lib/engine/simulation');

/**
 * @openapi
 * /api/state:
 *   get:
 *     summary: Obtener estado actual del juego
 *     description: Devuelve el estado completo de la simulación — servidores, servicios, finanzas, uptime, clientes, logs y eventos activos.
 *     tags: [Simulación]
 *     responses:
 *       200:
 *         description: Estado actual del juego
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gameTime:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: integer
 *                       example: 3
 *                     hour:
 *                       type: number
 *                       example: 14.5
 *                     formatted:
 *                       type: string
 *                       example: "Día 3, 14:30"
 *                 servers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: web-1
 *                       name:
 *                         type: string
 *                         example: Web-1
 *                       status:
 *                         type: string
 *                         enum: [green, yellow, red]
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                 finance:
 *                   type: object
 *                 uptime:
 *                   type: object
 *                 clients:
 *                   type: array
 *                   items:
 *                     type: object
 *                 paused:
 *                   type: boolean
 *                 bankrupt:
 *                   type: boolean
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                 activeEvents:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Sesión no proporcionada o expirada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 */
router.get('/', requireSession, (req, res) => {
  res.json(getCurrentState(req.gameState));
});

module.exports = router;
