const { startSimulation, unpauseSimulation, getCurrentState, resetSimulation } = require('./tick');
const { handleAction } = require('./actions');
const { getServerDiagnostics } = require('./diagnostics');

module.exports = {
  startSimulation,
  unpauseSimulation,
  getCurrentState,
  handleAction,
  resetSimulation,
  getServerDiagnostics,
};
