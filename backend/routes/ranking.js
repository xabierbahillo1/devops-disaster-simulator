const express = require('express');
const router = express.Router();
const { getRanking } = require('../lib/data/db');

router.get('/', async (req, res) => {
  try {
    const rows = await getRanking(50);

    const ranking = rows.map((row, i) => ({
      rank: i + 1,
      nick: row.nickname,
      days: row.days,
      uptime: parseFloat(row.uptime),
      balance: row.balance,
      clients: row.clients,
    }));

    res.json({ success: true, ranking });
  } catch (err) {
    console.error('[RANKING] Error al obtener ranking:', err.message);
    res.status(500).json({ success: false, message: 'Error al obtener ranking' });
  }
});

module.exports = router;
