const { TRAFFIC_CURVE } = require('./constants');
const { clamp, rng } = require('./helpers');

function naturalDrift(state) {
  const hour = state.gameTime.hour;
  const trafficMod = TRAFFIC_CURVE[hour] || 0.5;

  const activeClients = state.clients.filter(c => !c.churned);
  const totalLoadFactor = activeClients.reduce((sum, c) => sum + c.loadFactor, 0);

  const webCount = state.servers.filter(s => s.type === 'web' && !s.down).length || 1;
  const backendCount = state.servers.filter(s => s.type === 'backend' && !s.down).length || 1;
  const dbCount = state.servers.filter(s => s.type === 'database' && !s.down).length || 1;

  state.servers.forEach(s => {
    if (s.down || s.rebooting) return;

    let baseCpu, baseRam;
    const load = totalLoadFactor;
    switch (s.type) {
      case 'web':
        baseCpu = (10 + trafficMod * 45 * load) / webCount + 5;
        baseRam = (0.4 + trafficMod * 1.6 * load) / webCount + 0.3;
        break;
      case 'backend':
        baseCpu = (12 + trafficMod * 50 * load) / backendCount + 5;
        baseRam = (0.6 + trafficMod * 2.0 * load) / backendCount + 0.4;
        break;
      case 'database':
        baseCpu = (10 + trafficMod * 35 * load) / dbCount + 5;
        baseRam = (1.0 + trafficMod * 2.5 * load) / dbCount + 0.5;
        break;
      default:
        baseCpu = 10; baseRam = 0.5;
    }

    s.usage.cpuPercent = clamp(
      s.usage.cpuPercent + (baseCpu - s.usage.cpuPercent) * 0.3 + rng(-4, 4),
      3, 99
    );
    s.usage.ramUsedGB = clamp(
      s.usage.ramUsedGB + (baseRam - s.usage.ramUsedGB) * 0.15 + rng(-0.1, 0.1),
      0.2, s.specs.ramGB * 0.98
    );

    s.usage.diskUsedGB = clamp(s.usage.diskUsedGB + rng(0.01, 0.08), 1, s.specs.diskGB * 0.99);

    s.uptimeHours += state.currentTickHours;
  });
}

module.exports = { naturalDrift };
