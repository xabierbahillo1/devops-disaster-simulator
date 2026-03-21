const { POTENTIAL_CLIENTS, BANKRUPTCY_BALANCE } = require('./constants');
const { addLog } = require('./logging');

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
  }
}

function checkNoClients(state) {
  if (state.noClients || state.bankrupt) return;
  const active = state.clients.filter(c => !c.churned);
  if (state.clients.length > 0 && active.length === 0) {
    state.noClients = true;
    addLog(state, `[FIN] ⚠ Todos los clientes han abandonado la empresa. No hay ingresos posibles.`, 'critical');
  }
}

module.exports = { checkNewClients, checkBankruptcy, checkNoClients };
