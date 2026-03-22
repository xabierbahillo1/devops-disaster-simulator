const {
  DOWNTIME_WARNING_HOURS, DOWNTIME_CLAIM_HOURS,
  DOWNTIME_CRITICAL_HOURS, DOWNTIME_CHURN_HOURS,
} = require('../core/constants');
const { formatGameTime } = require('../core/helpers');
const { addLog } = require('../core/logging');
const { getOverallHealth } = require('../engine/status');

function calculateFinancials(state) {
  const totalCostPerHour = state.servers.reduce((sum, s) => sum + s.costPerHour, 0);
  const costThisTick = totalCostPerHour * state.currentTickHours;
  state.finance.totalCost += costThisTick;
  state.finance.costPerHour = totalCostPerHour;
  state.finance.costPerDay = totalCostPerHour * 24;

  const health = getOverallHealth(state);

  const blockedWebServers = state.servers.filter(s => s.type === 'web' && s._trafficBlocked).length;
  const totalWebServers = state.servers.filter(s => s.type === 'web').length;
  const trafficPenalty = totalWebServers > 0 ? (1 - blockedWebServers / totalWebServers * 0.6) : 1;

  let revenueThisTick = 0;
  state.clients.forEach(c => {
    if (c.churned) return;
    if (health === 'up') {
      revenueThisTick += c.revenuePerHour * state.currentTickHours * trafficPenalty;
    } else if (health === 'degraded') {
      revenueThisTick += c.revenuePerHour * 0.3 * state.currentTickHours * trafficPenalty;
    }
  });
  state.finance.totalRevenue += revenueThisTick;

  // Seguimiento de downtime y penalizaciones SLA
  state.uptime.totalHours += state.currentTickHours;

  const UPTIME_WINDOW = 48;
  const downFraction = health === 'down' ? 1 : health === 'degraded' ? 0.25 : 0;
  state.uptime.history.push({ hours: state.currentTickHours, down: state.currentTickHours * downFraction });
  let histTotal = state.uptime.history.reduce((s, e) => s + e.hours, 0);
  while (histTotal > UPTIME_WINDOW && state.uptime.history.length > 1) {
    histTotal -= state.uptime.history[0].hours;
    state.uptime.history.shift();
  }

  if (health === 'down') {
    state.uptime.downHours += state.currentTickHours;
    state.consecutiveDownHours += state.currentTickHours;

    state.clients.forEach(c => {
      if (c.churned) return;

      const escalation = Math.pow(c.penaltyEscalation, Math.floor(state.consecutiveDownHours / 4));

      if (state.consecutiveDownHours >= DOWNTIME_WARNING_HOURS && !c._warned) {
        c._warned = true;
        addLog(state, `[CLIENTE] ${c.name}: "Estamos experimentando problemas con vuestro servicio. ¿Qué está pasando?"`, 'warning');
      }

      if (state.consecutiveDownHours >= DOWNTIME_CLAIM_HOURS && !c._claimed) {
        c._claimed = true;
        const claimAmount = Math.round(c.penaltyPerHour * 4 * escalation);
        state.finance.penalties = (state.finance.penalties || 0) + claimAmount;
        state.finance.totalCost += claimAmount;
        addLog(state, `[SLA] ${c.name} reclama compensación por incumplimiento de SLA (${c.sla}%): -$${claimAmount}`, 'critical');
      }

      if (state.consecutiveDownHours >= DOWNTIME_CRITICAL_HOURS && !c._threatened) {
        c._threatened = true;
        const claimAmount = Math.round(c.penaltyPerHour * 8 * escalation);
        state.finance.penalties = (state.finance.penalties || 0) + claimAmount;
        state.finance.totalCost += claimAmount;
        addLog(state, `[SLA] ${c.name}: "Si no se restaura el servicio en las próximas horas, rescindiremos el contrato." Penalización: -$${claimAmount}`, 'critical');
      }

      if (state.consecutiveDownHours >= DOWNTIME_CHURN_HOURS && !c.churned) {
        c.churned = true;
        c.churnedAt = formatGameTime(state.gameTime);
        const exitPenalty = Math.round(c.penaltyPerHour * 24);
        state.finance.penalties = (state.finance.penalties || 0) + exitPenalty;
        state.finance.totalCost += exitPenalty;
        state.finance.lostClients = (state.finance.lostClients || 0) + 1;
        addLog(state, `[CLIENTE] ⚠ ${c.name} HA RESCINDIDO EL CONTRATO. Penalización de salida: -$${exitPenalty}.`, 'critical');
      }
    });

  } else if (health === 'degraded') {
    state.uptime.downHours += state.currentTickHours * 0.25;
    state.consecutiveDownHours = Math.max(0, state.consecutiveDownHours - state.currentTickHours * 0.5);

    state.clients.forEach(c => {
      if (c.churned) return;
      if (c.sla >= 99.5 && state.consecutiveDownHours > 2 && !c._degradedWarned) {
        c._degradedWarned = true;
        addLog(state, `[CLIENTE] ${c.name}: "Estamos notando latencia alta. Nuestro SLA es del ${c.sla}%."`, 'warning');
      }
    });

  } else {
    if (state.consecutiveDownHours > 0) {
      addLog(state, `[SISTEMA] Servicio restaurado tras ${state.consecutiveDownHours}h de interrupción`, 'success');
    }
    state.consecutiveDownHours = 0;
    state.clients.forEach(c => {
      c._warned = false;
      c._claimed = false;
      c._threatened = false;
      c._degradedWarned = false;
    });
  }

  const winTotal = state.uptime.history.reduce((s, e) => s + e.hours, 0);
  const winDown = state.uptime.history.reduce((s, e) => s + e.down, 0);
  state.uptime.actual = winTotal > 0
    ? ((winTotal - winDown) / winTotal * 100)
    : 100;
}

module.exports = { calculateFinancials };
