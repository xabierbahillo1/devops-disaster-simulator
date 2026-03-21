const express = require('express');
const router  = express.Router();
const { requireSession } = require('../middleware/session');
const { getCurrentState } = require('../lib/simulation');

router.get('/', requireSession, (req, res) => {
  res.json(getCurrentState(req.gameState));
});

module.exports = router;
