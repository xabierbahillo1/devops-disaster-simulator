function updateServerStatus(s) {
  if (s.rebooting) { s.status = 'yellow'; s.down = true; return; }
  if (s.down) { s.status = 'red'; return; }
  const cpuPct = s.usage.cpuPercent;
  const ramPct = (s.usage.ramUsedGB / s.specs.ramGB) * 100;
  const diskPct = (s.usage.diskUsedGB / s.specs.diskGB) * 100;
  const maxLoad = Math.max(cpuPct, ramPct);
  if (maxLoad >= 95 || diskPct >= 90) s.status = 'red';
  else if (maxLoad >= 80 || diskPct >= 80) s.status = 'yellow';
  else s.status = 'green';
}

function updateServiceStatuses(state) {
  state.services.forEach(svc => {
    const depServers = svc.dependsOn.map(id => state.servers.find(s => s.id === id));
    if (svc.mode === 'ha') {
      const anyUp = depServers.some(s => s && !s.down);
      const allUp = depServers.every(s => s && !s.down);
      const anyDegraded = depServers.some(s => s && s.status === 'yellow' && !s.down);
      svc.status = !anyUp ? 'red' : (!allUp || anyDegraded) ? 'yellow' : 'green';
    } else {
      const s = depServers[0];
      svc.status = (!s || s.down) ? 'red' : s.status;
    }
  });
}

function getOverallHealth(state) {
  const allUp = state.services.every(s => s.status === 'green');
  const anyDown = state.services.some(s => s.status === 'red');
  return anyDown ? 'down' : allUp ? 'up' : 'degraded';
}

function recordMetrics(state) {
  state.servers.forEach(s => {
    if (!state.metricsHistory[s.id]) state.metricsHistory[s.id] = { cpu: [], ram: [] };
    state.metricsHistory[s.id].cpu.push(Math.round(s.usage.cpuPercent));
    const ramPct = s.specs.ramGB > 0 ? Math.round((s.usage.ramUsedGB / s.specs.ramGB) * 100) : 0;
    state.metricsHistory[s.id].ram.push(ramPct);
    if (state.metricsHistory[s.id].cpu.length > 50) {
      state.metricsHistory[s.id].cpu.shift();
      state.metricsHistory[s.id].ram.shift();
    }
  });
}

module.exports = { updateServerStatus, updateServiceStatuses, getOverallHealth, recordMetrics };
