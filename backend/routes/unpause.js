const express = require('express');
const router  = express.Router();
const { requireSession } = require('../middleware/session');
const { unpauseSimulation } = require('../lib/engine/simulation');

/**
 * @openapi
 * /api/unpause:
 *   post:
 *     summary: Reanudar la simulación
 *     description: Despausa la simulación después de un evento (primer servidor caído, llegada de nuevo cliente).
 *     tags: [Control]
 *     responses:
 *       200:
 *         description: Simulación reanudada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Sesión no proporcionada o expirada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 */
router.post('/', requireSession, (req, res) => {
  unpauseSimulation(req.gameState);
  res.json({ success: true });
});

module.exports = router;
