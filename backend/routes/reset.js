const express = require('express');
const router  = express.Router();
const { requireSession } = require('../middleware/session');
const { resetSimulation } = require('../lib/simulation');

router.post('/', requireSession, (req, res) => {
  resetSimulation(req.gameState);
  res.json({ success: true, message: 'Simulation reset' });
});

module.exports = router;
