require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger.json');
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

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/session', sessionRouter);
app.use('/api/state', stateRouter);
app.use('/api/action', actionRouter);
app.use('/api/reset', resetRouter);
app.use('/api/unpause', unpauseRouter);
app.use('/api/ssh', sshRouter);
app.use('/api/ranking', rankingRouter);

async function start() {
  try {
    await initDB();
    await restoreSessions(resumeSimulation);
    app.listen(PORT, () => {
      console.log(`[DEVOPS-SIM] Backend running on http://localhost:${PORT}`);
      console.log(`[DEVOPS-SIM] API docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error('[DEVOPS-SIM] Error al iniciar:', err.message);
    process.exit(1);
  }
}

start();
