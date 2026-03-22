const express = require('express');
const router = express.Router();
const { getRanking } = require('../lib/data/db');

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
    console.error('[RANKING] Error al obtener ranking:', err.message);
    res.status(500).json({ success: false, message: 'Error al obtener ranking' });
  }
});

module.exports = router;
