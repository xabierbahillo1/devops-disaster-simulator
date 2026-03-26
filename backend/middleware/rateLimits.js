const rateLimit = require('express-rate-limit');

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiadas peticiones, intenta de nuevo en un momento' },
});

// Rate limit para creacion de sesiones
const sessionCreateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Has creado demasiadas sesiones recientemente, espera unos minutos' },
});

// Rate limiting para el asistente IA
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiadas peticiones al asistente, espera un momento' },
});

module.exports = { globalLimiter, sessionCreateLimiter, aiLimiter };
