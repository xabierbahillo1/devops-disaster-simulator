const {
  GAME_HOURS_PER_TICK, DEV_COST_BASE, DEV_HOURLY_RATE,
  SERVER_TEMPLATES, PURCHASE_SETUP_FEE, PURCHASE_PROVISION_TICKS,
} = require('../core/constants');
const { clamp, rng, calcCostPerHour } = require('../core/helpers');
const { addLog } = require('../core/logging');
const { updateServerStatus, updateServiceStatuses } = require('../engine/status');
const { rebuildServices } = require('./servers');

function handleRestart(state, targetId) {
  const server = state.servers.find(s => s.id === targetId);
  if (!server) return { success: false, message: 'Servidor no encontrado' };
  if (server.rebooting) return { success: false, message: `${server.name} ya se está reiniciando` };

  server.rebooting = true;
  server.down = true;
  server.rebootTicksLeft = 1;
  updateServerStatus(server);

  server.issues = server.issues.filter(i => i.persistent);

  addLog(state, `[ACCIÓN] Reiniciando ${server.name}...`, 'info');

  state.activeEvents.forEach(ev => {
    if (ev.target === targetId && !ev.resolved) {
      const issue = server.issues.find(i => i.id === ev.issueId);
      if (!issue) ev.resolved = true;
    }
  });

  return { success: true, message: `Reiniciando ${server.name}...` };
}

function handleScale(state, targetId, params) {
  const server = state.servers.find(s => s.id === targetId);
  if (!server) return { success: false, message: 'Servidor no encontrado' };
  if (!params) return { success: false, message: 'Especifica los nuevos recursos' };

  const oldSpecs = { ...server.specs };
  const newCores = params.cpuCores || server.specs.cpuCores;
  const newRam = params.ramGB || server.specs.ramGB;
  const newDisk = params.diskGB || server.specs.diskGB;

  const needsReboot = newCores !== server.specs.cpuCores || newRam !== server.specs.ramGB;

  const coreJumps = Math.abs(newCores - server.specs.cpuCores);
  const ramJumps = Math.abs(newRam - server.specs.ramGB);

  server.specs.cpuCores = newCores;
  server.specs.ramGB = newRam;
  server.specs.diskGB = Math.max(newDisk, Math.ceil(server.usage.diskUsedGB) + 1);
  server.costPerHour = calcCostPerHour(server.specs);

  if (needsReboot && !server.rebooting) {
    server.rebooting = true;
    server.down = true;
    server.rebootTicksLeft = coreJumps + ramJumps > 8 ? 2 : 1;
    server._scaleInstabilityTicks = Math.floor((coreJumps + ramJumps) / 2) + 1;
    addLog(state, `[ESCALADO] ${server.name}: ${oldSpecs.cpuCores}→${newCores} vCPU, ${oldSpecs.ramGB}→${newRam} GB RAM, ${oldSpecs.diskGB}→${server.specs.diskGB} GB disco — reiniciando`, 'info');
  } else {
    addLog(state, `[ESCALADO] ${server.name}: disco ampliado a ${server.specs.diskGB} GB`, 'info');
  }

  state.finance.costPerHour = state.servers.reduce((sum, x) => sum + x.costPerHour, 0);
  state.finance.costPerDay = state.finance.costPerHour * 24;

  updateServerStatus(server);
  return {
    success: true,
    message: needsReboot
      ? `${server.name} escalando (requiere reinicio)...`
      : `${server.name} disco ampliado`,
  };
}

function handleRollback(state, targetId) {
  const server = state.servers.find(s => s.id === targetId);
  if (!server) return { success: false, message: 'Servidor no encontrado' };
  const deployIssue = server.issues.find(i => i.type === 'bad_deploy');
  if (!deployIssue) return { success: false, message: 'No hay deploy que revertir en este servidor' };

  server.issues = server.issues.filter(i => i.type !== 'bad_deploy');
  server.rebooting = true;
  server.down = true;
  server.rebootTicksLeft = 1;

  state.activeEvents.forEach(ev => {
    if (ev.target === targetId && ev.type === 'bad_deploy') ev.resolved = true;
  });

  addLog(state, `[ROLLBACK] ${server.name}: Revirtiendo a versión anterior — reiniciando`, 'info');
  return { success: true, message: `Rollback en ${server.name}...` };
}

function handleReportBug(state, targetId, params) {
  const server = state.servers.find(s => s.id === targetId);
  if (!server) return { success: false, message: 'Servidor no encontrado' };
  const issueId = params?.issueId;
  const issue = issueId
    ? server.issues.find(i => i.id === issueId)
    : server.issues.find(i => i.persistent && i.devFixTicksLeft === undefined);

  if (!issue) return { success: false, message: 'No se identifica un bug que reportar' };
  if (issue.devFixTicksLeft !== undefined) return { success: false, message: 'Ya hay un ticket abierto para este issue' };

  let estimatedHours = 4;
  if (issue.severity === 'critical') estimatedHours = 8;
  if (issue.type === 'connection_pool' || issue.type === 'slow_queries') estimatedHours = 12;

  estimatedHours += Math.floor(rng(-1, 2));

  const estimatedCost = Math.round(DEV_COST_BASE + estimatedHours * DEV_HOURLY_RATE);

  if (!params?.confirmed) {
    return {
      success: true,
      needsConfirmation: true,
      estimate: {
        cost: estimatedCost,
        hours: estimatedHours,
        issueType: issue.type,
        issueId: issue.id,
        baseCost: DEV_COST_BASE,
        hourlyRate: DEV_HOURLY_RATE,
      },
      message: `Estimación: ~$${estimatedCost} (~${estimatedHours}h @ $${DEV_HOURLY_RATE}/h + $${DEV_COST_BASE} base). ¿Confirmar?`,
    };
  }

  const costVariance = rng(0.7, 1.3);
  const realCost = Math.round(estimatedCost * costVariance);

  const estimatedTicks = Math.ceil(estimatedHours / GAME_HOURS_PER_TICK);
  const hoursVariance = rng(0.7, 1.3);
  const realTicks = Math.max(2, Math.round(estimatedTicks * hoursVariance));

  state.finance.totalCost += realCost;
  state.finance.devCosts = (state.finance.devCosts || 0) + realCost;

  issue.devFixTicksLeft = realTicks;
  const realHours = realTicks * GAME_HOURS_PER_TICK;

  addLog(state, `[DEV] Ticket creado para ${server.name} — estimado ~$${estimatedCost}, actual: $${realCost} (~${realHours}h)`, 'info');
  return { success: true, message: `Ticket creado. Coste: $${realCost}. ETA: ~${realHours}h` };
}

function handlePurgeLogs(state, targetId) {
  const server = state.servers.find(s => s.id === targetId);
  if (!server) return { success: false, message: 'Servidor no encontrado' };
  const freed = server.usage.diskUsedGB * rng(0.3, 0.5);
  server.usage.diskUsedGB = clamp(server.usage.diskUsedGB - freed, 1, server.specs.diskGB);

  const diskPct = (server.usage.diskUsedGB / server.specs.diskGB) * 100;

  updateServerStatus(server);
  addLog(state, `[LIMPIEZA] ${server.name}: ${freed.toFixed(1)} GB liberados — disco al ${Math.round(diskPct)}%`, 'success');
  return { success: true, message: `${freed.toFixed(1)} GB liberados` };
}

function handleBlockTraffic(state, targetId) {
  const server = state.servers.find(s => s.id === targetId);
  if (!server) return { success: false, message: 'Servidor no encontrado' };
  server._trafficBlocked = true;
  server._trafficBlockTicksLeft = Math.floor(rng(4, 8));

  server.issues = server.issues.filter(i => i.type !== 'ddos');
  state.activeEvents.forEach(ev => {
    if (ev.target === targetId && ev.type === 'ddos') ev.resolved = true;
  });

  addLog(state, `[FIREWALL] ${server.name}: Tráfico bloqueado`, 'warning');
  return { success: true, message: `Tráfico bloqueado en ${server.name}` };
}

function handlePurchaseServer(state, targetId, params) {
  const serverType = params?.serverType;
  const template = SERVER_TEMPLATES[serverType];
  if (!template) return { success: false, message: 'Tipo de servidor no válido' };

  const setupFee = PURCHASE_SETUP_FEE[serverType];

  if (!params?.confirmed) {
    const hourlyRate = calcCostPerHour(template.baseSpecs);
    return {
      success: true,
      needsConfirmation: true,
      estimate: {
        type: serverType,
        setupFee,
        hourlyRate,
        monthlyRate: Math.round(hourlyRate * 730),
        specs: template.baseSpecs,
        provisionHours: PURCHASE_PROVISION_TICKS * GAME_HOURS_PER_TICK,
      },
      message: `${template.role}: Setup $${setupFee} + $${Math.round(hourlyRate * 730)}/mes. ¿Confirmar?`,
    };
  }

  state.finance.totalCost += setupFee;
  state.serverIdCounters[serverType]++;
  const count = state.serverIdCounters[serverType];
  const typePrefix = serverType === 'web' ? 'Web' : serverType === 'backend' ? 'Backend' : 'DB';
  const newId = `${serverType === 'database' ? 'db' : serverType === 'backend' ? 'backend' : 'web'}-${count}`;

  const newServer = {
    id: newId,
    name: `${typePrefix}-${count}`,
    type: template.type,
    role: template.role,
    os: template.os,
    ip: `${template.subnet}.${10 + count}`,
    specs: { ...template.baseSpecs },
    usage: { cpuPercent: 0, ramUsedGB: 0, diskUsedGB: 1 },
    costPerHour: calcCostPerHour(template.baseSpecs),
    status: 'yellow',
    down: true,
    rebooting: true,
    rebootTicksLeft: PURCHASE_PROVISION_TICKS,
    uptimeHours: 0,
    issues: [],
  };

  state.servers.push(newServer);
  rebuildServices(state);
  updateServiceStatuses(state);

  state.finance.costPerHour = state.servers.reduce((sum, x) => sum + x.costPerHour, 0);
  state.finance.costPerDay = state.finance.costPerHour * 24;

  addLog(state, `[COMPRA] Nuevo servidor ${newServer.name} (${template.role}) — Setup: $${setupFee}, provisionando (~${PURCHASE_PROVISION_TICKS * GAME_HOURS_PER_TICK}h)`, 'info');
  return { success: true, message: `${newServer.name} provisionándose... (~${PURCHASE_PROVISION_TICKS * GAME_HOURS_PER_TICK}h)` };
}

function handleIgnore(state, targetId) {
  const evToIgnore = state.activeEvents.find(e => e.target === targetId && !e.resolved);
  if (evToIgnore) evToIgnore.resolved = true;
  return { success: true, message: 'Ignorado' };
}

// Registro de handlers
const handlers = {
  restart:         (state, targetId) => handleRestart(state, targetId),
  scale:           (state, targetId, params) => handleScale(state, targetId, params),
  rollback:        (state, targetId) => handleRollback(state, targetId),
  report_bug:      (state, targetId, params) => handleReportBug(state, targetId, params),
  purge_logs:      (state, targetId) => handlePurgeLogs(state, targetId),
  block_traffic:   (state, targetId) => handleBlockTraffic(state, targetId),
  purchase_server: (state, targetId, params) => handlePurchaseServer(state, targetId, params),
  ignore:          (state, targetId) => handleIgnore(state, targetId),
};

function handleAction(state, { type, targetId, params }) {
  const handler = handlers[type];
  if (!handler) return { success: false, message: 'Acción desconocida' };
  return handler(state, targetId, params);
}

module.exports = { handleAction };
