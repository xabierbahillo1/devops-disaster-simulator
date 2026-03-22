const { POTENTIAL_CLIENTS, BANKRUPTCY_BALANCE } = require('../core/constants');
const { addLog } = require('../core/logging');
const { finishGame } = require('../data/db');

function checkNewClients(state) {
  if (state.potentialClientIndex >= POTENTIAL_CLIENTS.length) return;

  const candidate = POTENTIAL_CLIENTS[state.potentialClientIndex];
  const currentUptime = state.uptime.actual;
  const currentDay = state.gameTime.day;

  if (currentDay >= candidate.minDays && currentUptime >= candidate.minUptime) {
    const bonusDays = currentDay - candidate.minDays;
    const chance = 0.08 + bonusDays * 0.015;

    if (Math.random() < chance) {
      const newClient = { ...candidate };
      delete newClient.minUptime;
      delete newClient.minDays;
      state.clients.push(newClient);
      state.potentialClientIndex++;

      addLog(state, `[NUEVO CLIENTE] ★ ${newClient.name} ha contratado tus servicios (SLA: ${newClient.sla}%, +$${newClient.revenuePerHour}/h)`, 'success');
      addLog(state, `[AVISO] La carga aumentará. Revisa si tu infraestructura puede soportar ${state.clients.filter(c => !c.churned).length} clientes.`, 'warning');

      state.newClientArrived = { name: newClient.name, sla: newClient.sla, revenuePerHour: newClient.revenuePerHour };
      state.paused = true;
    }
  }
}

function checkBankruptcy(state) {
  const balance = state.finance.totalRevenue - state.finance.totalCost;
  if (balance <= BANKRUPTCY_BALANCE && !state.bankrupt) {
    state.bankrupt = true;
    addLog(state, `[QUIEBRA] ⚠ La empresa ha entrado en bancarrota. Balance: $${Math.round(balance)}. Los acreedores han intervenido.`, 'critical');
    persistFinishedGame(state, 'bankrupt');
  }
}

function checkNoClients(state) {
  if (state.noClients || state.bankrupt) return;
  const active = state.clients.filter(c => !c.churned);
  if (state.clients.length > 0 && active.length === 0) {
    state.noClients = true;
    addLog(state, `[FIN] ⚠ Todos los clientes han abandonado la empresa. No hay ingresos posibles.`, 'critical');
    persistFinishedGame(state, 'no_clients');
  }
}

function getGameMetrics(state) {
  const totalHours = state.uptime.totalHours || 0;
  const downHours = state.uptime.downHours || 0;
  const realUptime = totalHours > 0
    ? Math.round(((totalHours - downHours) / totalHours) * 10000) / 100
    : 100;

  return {
    days: state.gameTime.day,
    uptime: realUptime,
    balance: Math.round(state.finance.totalRevenue - state.finance.totalCost),
    clients: state.clients.filter(c => !c.churned).length,
    totalHours: Math.round(totalHours * 100) / 100,
    downHours: Math.round(downHours * 100) / 100,
  };
}

function persistFinishedGame(state, endReason) {
  if (!state._gameId || state._gameFinished) return;
  state._gameFinished = true;

  const metrics = getGameMetrics(state);
  finishGame(state._gameId, { ...metrics, endReason }).catch((err) => {
    console.error('[DB] Error al finalizar partida:', err.message);
    state._gameFinished = false;
  });
}

module.exports = { checkNewClients, checkBankruptcy, checkNoClients, getGameMetrics, persistFinishedGame };
