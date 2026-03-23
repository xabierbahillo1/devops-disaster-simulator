const express = require('express');
const router = express.Router();
const logger = require('../lib/core/logger');
const { getRanking } = require('../lib/data/db');

/**
 * @openapi
 * /api/ranking:
 *   get:
 *     summary: Obtener ranking de partidas terminadas
 *     description: Devuelve las partidas terminadas ordenadas por rendimiento. Endpoint público, no requiere sesión.
 *     tags: [Ranking]
 *     security: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrar por nickname
 *     responses:
 *       200:
 *         description: Ranking de partidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 ranking:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rank:
 *                         type: integer
 *                         example: 1
 *                       nick:
 *                         type: string
 *                         example: xabi_ops
 *                       days:
 *                         type: integer
 *                         example: 42
 *                       uptime:
 *                         type: number
 *                         example: 99.87
 *                       balance:
 *                         type: integer
 *                         example: 12450
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 total:
 *                   type: integer
 *       500:
 *         description: Error interno al consultar la base de datos
 */
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const search = req.query.search || '';

    const { rows, total } = await getRanking({ page, limit: 8, search });
    const totalPages = Math.ceil(total / 8);
    const baseRank = (page - 1) * 8;

    const ranking = rows.map((row, i) => {
      const totalH = parseFloat(row.total_hours) || 0;
      const downH = parseFloat(row.down_hours) || 0;
      const realUptime = totalH > 0
        ? Math.round(((totalH - downH) / totalH) * 10000) / 100
        : 100;

      return {
        rank: row.global_rank ? parseInt(row.global_rank) : baseRank + i + 1,
        nick: row.nickname,
        days: row.days,
        uptime: realUptime,
        balance: row.balance,
      };
    });

    res.json({ success: true, ranking, page, totalPages, total });
  } catch (err) {
    logger.error('Error al obtener ranking', { error: err.message, stack: err.stack });
    res.status(500).json({ success: false, message: 'Error al obtener ranking' });
  }
});

module.exports = router;
