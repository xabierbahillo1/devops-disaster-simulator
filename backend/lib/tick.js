const { createState } = require('./state');
const {
  TICK_MS, TICK_MS_DEGRADED, TICK_MS_DOWN,
  GAME_HOURS_PER_TICK, MONTHLY_BUDGET, INITIAL_CLIENTS,
} = require('./constants');
const { formatGameTime } = require('./helpers');
const { addLog } = require('./logging');
const { freshServers, rebuildServices } = require('./servers');
const { updateServerStatus, updateServiceStatuses, getOverallHealth, recordMetrics } = require('./status');
const { naturalDrift } = require('./drift');
const { processIssues, processReboots } = require('./issues');
const { pickEvent, applyEvent } = require('./events');
const { calculateFinancials } = require('./financials');
const { checkNewClients, checkBankruptcy, checkNoClients } = require('./clients');

function advanceTime(state, hours) {
  state.gameTime.totalHours += hours;
  state.gameTime.hour += hours;
  while (state.gameTime.hour >= 24) {
    state.gameTime.hour -= 24;
    state.gameTime.day++;
  }
}

function tick(state) {
  if (state.bankrupt || state.noClients) return;
  if (state.paused) { state.simulationInterval = setTimeout(() => tick(state), TICK_MS); return; }

  const health = getOverallHealth(state);
  state.currentTickHours = health === 'down' ? 0.5
    : health === 'degraded' ? 1
    : GAME_HOURS_PER_TICK;
  const nextTickMs = health === 'down' ? TICK_MS_DOWN
    : health === 'degraded' ? TICK_MS_DEGRADED
    : TICK_MS;
  state.simulationInterval = setTimeout(() => tick(state), nextTickMs);

  advanceTime(state, state.currentTickHours);
  naturalDrift(state);
  processReboots(state);
  processIssues(state);

  if (state.gameTime.totalHours > 6 && Math.random() < 0.07) {
    const eventDef = pickEvent(state);
    applyEvent(state, eventDef);
  }

  // Auto-resolver traffic spikes y ddos cuando expiran
  state.servers.forEach(s => {
    s.issues.forEach(i => {
      if ((i.type === 'traffic_spike' || i.type === 'ddos') && i.ticksLeft !== undefined) {
        if (i.ticksLeft <= 0) {
          i._remove = true;
          state.activeEvents.forEach(ev => {
            if (ev.target === s.id && ev.type === i.type && !ev.resolved) ev.resolved = true;
          });
        }
      }
    });
    s.issues = s.issues.filter(i => !i._remove);
  });

  state.servers.forEach(updateServerStatus);
  updateServiceStatuses(state);

  // Primer servidor caido: pausamos para que el jugador reaccione
  if (!state.firstDownNotified && state.servers.some(s => s.down)) {
    state.firstDownNotified = true;
    state.paused = true;
  }

  calculateFinancials(state);
  recordMetrics(state);

  // Comprobar nuevos clientes cada 6h de juego
  if (state.gameTime.totalHours > 16 && state.gameTime.totalHours % 6 < state.currentTickHours) {
    checkNewClients(state);
  }

  checkBankruptcy(state);
  checkNoClients(state);

  state.activeEvents = state.activeEvents.filter(e => !e.resolved || (state.gameTime.totalHours - (e._resolvedAt || 0) < 10));
}

function resetSimulation(state) {
  state.gameTime = { day: 1, hour: 8, totalHours: 0 };
  state.servers = freshServers(state);
  rebuildServices(state);
  state.logs = [];
  state.activeEvents = [];
  state.metricsHistory = {};
  state.finance = { totalCost: 0, totalRevenue: 0, costPerHour: 0, costPerDay: 0, monthlyBudget: MONTHLY_BUDGET, devCosts: 0, penalties: 0, lostClients: 0 };
  state.uptime = { target: 99.5, actual: 100, totalHours: 0, downHours: 0, history: [] };
  state.pendingActions = [];
  state.eventIdCounter = 1;
  state.issueIdCounter = 1;
  state.consecutiveDownHours = 0;
  state.clients = INITIAL_CLIENTS.map(c => ({ ...c }));
  state.potentialClientIndex = 0;
  state.bankrupt = false;
  state.noClients = false;
  state.paused = true;
  state.firstDownNotified = false;
  state.newClientArrived = null;

  state.finance.costPerHour = state.servers.reduce((s, x) => s + x.costPerHour, 0);
  state.finance.costPerDay = state.finance.costPerHour * 24;

  addLog(state, '[SISTEMA] Simulacion iniciada — tu startup acaba de lanzarse', 'success');
  addLog(state, `[SISTEMA] 2 clientes iniciales: ${state.clients.map(c => c.name).join(', ')}. Recursos minimos. Crece segun demanda.`, 'info');
}

// Arranca el tick loop para una sesion
function startSimulation(session) {
  const state = createState(session.nickname);
  session.state = state;
  if (state.simulationInterval) clearTimeout(state.simulationInterval);
  resetSimulation(state);
  state.simulationInterval = setTimeout(() => tick(state), TICK_MS);
}

function unpauseSimulation(state) {
  state.paused = false;
  state.newClientArrived = null;
}

function getCurrentState(state) {
  return {
    gameTime: { ...state.gameTime, formatted: formatGameTime(state.gameTime), speed: state.currentTickHours === GAME_HOURS_PER_TICK ? 'normal' : state.currentTickHours <= 0.5 ? 'slow' : 'reduced' },
    servers: state.servers.map(s => ({
      ...s,
      specs: { ...s.specs },
      usage: { ...s.usage },
      issues: s.issues.map(i => ({
        id: i.id, type: i.type, severity: i.severity,
        devFixInProgress: i.devFixTicksLeft !== undefined && i.devFixTicksLeft > 0,
        devFixHoursLeft: i.devFixTicksLeft !== undefined ? i.devFixTicksLeft * GAME_HOURS_PER_TICK : null,
      })),
    })),
    services: state.services.map(s => ({ ...s })),
    logs: state.logs.slice(0, 80),
    finance: { ...state.finance },
    uptime: { ...state.uptime, actual: Math.round(state.uptime.actual * 100) / 100 },
    clients: state.clients.map(c => ({
      name: c.name, sla: c.sla, revenuePerHour: c.revenuePerHour,
      churned: !!c.churned, churnedAt: c.churnedAt || null,
      warning: !!c._warned, claimed: !!c._claimed, threatened: !!c._threatened,
    })),
    consecutiveDownHours: state.consecutiveDownHours,
    paused: !!state.paused,
    pauseReason: state.paused && state.newClientArrived ? 'new_client' : state.paused && state.firstDownNotified && state.servers.some(s => s.down) ? 'first_down' : null,
    newClient: state.newClientArrived || null,
    bankrupt: !!state.bankrupt,
    noClients: !!state.noClients,
    activeEvents: state.activeEvents.filter(e => !e.resolved).slice(-15),
    metricsHistory: JSON.parse(JSON.stringify(state.metricsHistory)),
  };
}

module.exports = { startSimulation, unpauseSimulation, getCurrentState, resetSimulation, handleAction: require('./actions').handleAction };
