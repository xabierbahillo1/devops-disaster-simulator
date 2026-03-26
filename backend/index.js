require('dotenv').config();

const express = require('express');
const cors = require('cors');
const expressWinston = require('express-winston');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./lib/core/swagger');
const logger = require('./lib/core/logger');
const { initDB } = require('./lib/data/db');
const { restoreSessions } = require('./lib/data/sessions');
const { resumeSimulation } = require('./lib/engine/tick');
const sessionRouter = require('./routes/session');
const stateRouter = require('./routes/state');
const actionRouter = require('./routes/action');
const resetRouter = require('./routes/reset');
const unpauseRouter = require('./routes/unpause');
const sshRouter = require('./routes/ssh');
const rankingRouter = require('./routes/ranking');
const aiRouter = require('./routes/ai');
const { globalLimiter, aiLimiter } = require('./middleware/rateLimits');

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://devops-sim.xabierbahillo.dev'
  ],
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-session-key'],
}));

app.use(express.json({ limit: '512kb' }));

app.use(globalLimiter);

// HTTP request logging (excluye /api/state para no saturar logs con polling)
app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  requestWhitelist: [],
  responseWhitelist: [],
  dynamicMeta: (req, res) => res.locals.nickname
    ? { nickname: res.locals.nickname.replace(/[^\w\-_.]/g, '').substring(0, 30) }
    : {},
  msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
  colorize: true,
  ignoreRoute: (req) => req.url === '/api/state' || req.url.startsWith('/api-docs'),
}));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/session', sessionRouter);
app.use('/api/state', stateRouter);
app.use('/api/action', actionRouter);
app.use('/api/reset', resetRouter);
app.use('/api/unpause', unpauseRouter);
app.use('/api/ssh', sshRouter);
app.use('/api/ranking', rankingRouter);
app.use('/api/ai', aiLimiter, aiRouter);

// Error logging
app.use(expressWinston.errorLogger({
  winstonInstance: logger,
}));

// Error handler: captura errores
app.use((err, req, res, next) => {
  logger.error('Error no manejado', { error: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

async function start() {
  try {
    await initDB();
    await restoreSessions(resumeSimulation);
    app.listen(PORT, () => {
      logger.info(`Backend running on http://localhost:${PORT}`);
      logger.info(`API docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    logger.error('Error al iniciar', { error: err.message, stack: err.stack });
    process.exit(1);
  }
}

start();
