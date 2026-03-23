const express = require('express');
const router  = express.Router();
const { requireSession } = require('../middleware/session');
const { getServerDiagnostics } = require('../lib/engine/simulation');

/**
 * @openapi
 * /api/ssh/{serverId}:
 *   get:
 *     summary: Obtener diagnóstico SSH de un servidor
 *     description: Simula una conexión SSH y devuelve salida de comandos de diagnóstico (top, free, df, journalctl) con pistas sobre issues activos.
 *     tags: [Diagnóstico]
 *     parameters:
 *       - name: serverId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del servidor (ej. web-1, backend-1, db-1)
 *         example: web-1
 *     responses:
 *       200:
 *         description: Salida del diagnóstico SSH
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 connected:
 *                   type: boolean
 *                   description: Si la conexión fue exitosa (false si servidor caído)
 *                 output:
 *                   type: string
 *                   description: Salida de los comandos de diagnóstico
 *       401:
 *         description: Sesión no proporcionada o expirada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       404:
 *         description: Servidor no encontrado
 */
router.get('/:serverId', requireSession, (req, res) => {
  const diag = getServerDiagnostics(req.gameState, req.params.serverId);
  if (!diag) return res.status(404).json({ error: 'Servidor no encontrado' });
  res.json(diag);
});

module.exports = router;
