const express = require('express');
const router  = express.Router();
const { requireSession } = require('../middleware/session');
const { unpauseSimulation } = require('../lib/engine/simulation');

router.post('/', requireSession, (req, res) => {
  unpauseSimulation(req.gameState);
  res.json({ success: true });
});

module.exports = router;
