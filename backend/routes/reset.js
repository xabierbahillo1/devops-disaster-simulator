const express = require('express');
const router  = express.Router();
const { requireSession } = require('../middleware/session');
const { resetSimulation } = require('../lib/engine/simulation');

/**
 * @openapi
 * /api/reset:
 *   post:
 *     summary: Reiniciar la simulación
 *     description: Resetea toda la simulación al estado inicial (Día 1, 8:00, 2 clientes, 3 servidores).
 *     tags: [Control]
 *     responses:
 *       200:
 *         description: Simulación reiniciada
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
 *                   example: Simulation reset
 *       401:
 *         description: Sesión no proporcionada o expirada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 */
router.post('/', requireSession, (req, res) => {
  resetSimulation(req.gameState);
  res.json({ success: true, message: 'Simulation reset' });
});

module.exports = router;
