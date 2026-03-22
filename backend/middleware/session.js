const { getSession } = require('../lib/data/sessions');

function requireSession(req, res, next) {
  const key = req.headers['x-session-key'];
  if (!key) {
    return res.status(401).json({ success: false, message: 'Falta x-session-key header' });
  }
  const session = getSession(key);
  if (!session || !session.state) {
    return res.status(401).json({ success: false, message: 'Sesión no encontrada o expirada' });
  }
  req.gameState = session.state;
  req.sessionKey = key;
  next();
}

module.exports = { requireSession };
