const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger.json');
const sessionRouter = require('./routes/session');
const stateRouter = require('./routes/state');
const actionRouter = require('./routes/action');
const resetRouter = require('./routes/reset');
const unpauseRouter = require('./routes/unpause');
const sshRouter = require('./routes/ssh');

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

app.listen(PORT, () => {
  console.log(`[DEVOPS-SIM] Backend running on http://localhost:${PORT}`);
  console.log(`[DEVOPS-SIM] API docs: http://localhost:${PORT}/api-docs`);
});
