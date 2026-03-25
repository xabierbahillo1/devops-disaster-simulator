const { GAME_HOURS_PER_TICK } = require('./constants');

function createState(nickname) {
  return {
    nickname: nickname || 'Jugador',
    gameTime: null,
    servers: [],
    services: [],
    logs: [],
    activeEvents: [],
    metricsHistory: {},
    finance: {},
    uptime: {},
    pendingActions: [],
    simulationInterval: null,
    demoMode: false,
    eventIdCounter: 1,
    issueIdCounter: 1,
    clients: [],
    consecutiveDownHours: 0,
    potentialClientIndex: 0,
    bankrupt: false,
    noClients: false,
    paused: false,
    firstDownNotified: false,
    bankruptWarningShown: false,
    newClientArrived: null,
    phoneCallShown: false,
    phoneCallThreshold: 0,
    currentTickHours: GAME_HOURS_PER_TICK,
    serverIdCounters: { web: 1, backend: 1, database: 1 },
  };
}

module.exports = { createState };
