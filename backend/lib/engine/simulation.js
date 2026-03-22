const { startSimulation, unpauseSimulation, getCurrentState, resetSimulation } = require('./tick');
const { handleAction } = require('../game/actions');
const { getServerDiagnostics } = require('../infra/diagnostics');

module.exports = {
  startSimulation,
  unpauseSimulation,
  getCurrentState,
  handleAction,
  resetSimulation,
  getServerDiagnostics,
};
