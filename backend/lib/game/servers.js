const { calcCostPerHour } = require('../core/helpers');

function freshServers(state) {
  state.serverIdCounters = { web: 1, backend: 1, database: 1 };
  return [
    {
      id: 'web-1', name: 'Web-1', type: 'web',
      role: 'Servidor Web', os: 'Ubuntu 22.04 LTS', ip: '10.0.1.10',
      specs: { cpuCores: 1, ramGB: 2, diskGB: 20 },
      usage: { cpuPercent: 15, ramUsedGB: 0.6, diskUsedGB: 5 },
      costPerHour: 0,
      status: 'green', down: false, rebooting: false, rebootTicksLeft: 0,
      uptimeHours: 0,
      issues: [],
    },
    {
      id: 'backend-1', name: 'Backend-1', type: 'backend',
      role: 'Servidor API / Backend', os: 'Ubuntu 22.04 LTS', ip: '10.0.2.10',
      specs: { cpuCores: 1, ramGB: 2, diskGB: 20 },
      usage: { cpuPercent: 18, ramUsedGB: 0.8, diskUsedGB: 6 },
      costPerHour: 0,
      status: 'green', down: false, rebooting: false, rebootTicksLeft: 0,
      uptimeHours: 0,
      issues: [],
    },
    {
      id: 'db-1', name: 'DB-1', type: 'database',
      role: 'Base de Datos PostgreSQL', os: 'Ubuntu 22.04 LTS', ip: '10.0.3.10',
      specs: { cpuCores: 1, ramGB: 4, diskGB: 50 },
      usage: { cpuPercent: 12, ramUsedGB: 1.5, diskUsedGB: 8 },
      costPerHour: 0,
      status: 'green', down: false, rebooting: false, rebootTicksLeft: 0,
      uptimeHours: 0,
      issues: [],
    },
  ].map(s => { s.costPerHour = calcCostPerHour(s.specs); return s; });
}

function rebuildServices(state) {
  const webServers = state.servers.filter(s => s.type === 'web').map(s => s.id);
  const backendServers = state.servers.filter(s => s.type === 'backend').map(s => s.id);
  const dbServers = state.servers.filter(s => s.type === 'database').map(s => s.id);

  state.services = [
    { id: 'nginx', name: 'Nginx (Web)', dependsOn: webServers, mode: webServers.length > 1 ? 'ha' : 'single', status: 'green' },
    { id: 'api',   name: 'API Backend',  dependsOn: backendServers, mode: backendServers.length > 1 ? 'ha' : 'single', status: 'green' },
    { id: 'pgsql', name: 'PostgreSQL',   dependsOn: dbServers, mode: dbServers.length > 1 ? 'ha' : 'single', status: 'green' },
  ];
}

module.exports = { freshServers, rebuildServices };
