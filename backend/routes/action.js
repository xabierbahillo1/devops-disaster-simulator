const express = require('express');
const router  = express.Router();
const { requireSession } = require('../middleware/session');
const { handleAction } = require('../lib/engine/simulation');

router.post('/', requireSession, (req, res) => {
  const { type, targetId, params } = req.body;
  if (!type || !targetId) {
    return res.status(400).json({ success: false, message: 'Faltan type o targetId' });
  }
  res.json(handleAction(req.gameState, { type, targetId, params }));
});

module.exports = router;
