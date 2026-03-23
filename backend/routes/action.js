const express = require('express');
const router  = express.Router();
const { requireSession } = require('../middleware/session');
const { handleAction } = require('../lib/engine/simulation');

/**
 * @openapi
 * /api/action:
 *   post:
 *     summary: Ejecutar una acción del jugador
 *     description: Ejecuta una acción sobre un servidor. Algunas acciones (purchase_server, report_bug) requieren confirmación en dos pasos.
 *     tags: [Acciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, targetId]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [restart, scale, rollback, report_bug, purge_logs, block_traffic, purchase_server, ignore]
 *               targetId:
 *                 type: string
 *                 description: ID del servidor (ej. web-1). Para purchase_server usar 'new'.
 *                 example: web-1
 *               params:
 *                 type: object
 *                 properties:
 *                   cpuCores:
 *                     type: integer
 *                   ramGB:
 *                     type: integer
 *                   diskGB:
 *                     type: integer
 *                   serverType:
 *                     type: string
 *                     enum: [web, backend, database]
 *                   confirmed:
 *                     type: boolean
 *                   issueId:
 *                     type: integer
 *     responses:
 *       200:
 *         description: Resultado de la acción
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 needsConfirmation:
 *                   type: boolean
 *       400:
 *         description: Faltan parámetros requeridos
 *       401:
 *         description: Sesión no proporcionada o expirada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 */
router.post('/', requireSession, (req, res) => {
  const { type, targetId, params } = req.body;
  if (!type || !targetId) {
    return res.status(400).json({ success: false, message: 'Faltan type o targetId' });
  }
  res.json(handleAction(req.gameState, { type, targetId, params }));
});

module.exports = router;
