const express = require('express');
const router  = express.Router();
const { requireSession } = require('../middleware/session');
const { getServerDiagnostics } = require('../lib/simulation');

router.get('/:serverId', requireSession, (req, res) => {
  const diag = getServerDiagnostics(req.gameState, req.params.serverId);
  if (!diag) return res.status(404).json({ error: 'Servidor no encontrado' });
  res.json(diag);
});

module.exports = router;
