const express = require('express');
const router = express.Router();
const { createSession, getSession } = require('../lib/sessions');
const { startSimulation } = require('../lib/tick');

router.post('/', (req, res) => {
  const { nickname } = req.body;
  if (!nickname || !nickname.trim()) {
    return res.status(400).json({ success: false, message: 'Nickname requerido' });
  }

  const key = createSession(nickname.trim());
  const session = getSession(key);

  startSimulation(session);

  res.json({ success: true, sessionKey: key, nickname: nickname.trim() });
});

module.exports = router;
