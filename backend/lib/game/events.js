const { clamp, pick, rng } = require('../core/helpers');
const { addLog } = require('../core/logging');

const INC_MSGS = {
  traffic_spike: [
    'Latencia incrementándose en peticiones HTTP.',
    'Tiempo de respuesta elevado detectado por monitorización.',
  ],
  memory_leak: [
    'Alerta de memoria: uso creciente detectado.',
    'Threshold de RAM superado.',
  ],
  slow_queries: [
    'Incremento en tiempo de respuesta de la base de datos.',
    'Latencia en capa de datos por encima del umbral.',
  ],
  bad_deploy: [
    'Errores 500 detectados en producción.',
    'Incremento de excepciones no capturadas.',
  ],
  disk_filling: [
    'Alerta de espacio en disco.',
    'Umbral de almacenamiento superado.',
  ],
  ddos: [
    'Anomalía en patrón de tráfico detectada.',
    'Carga de red inusual.',
  ],
  connection_pool: [
    'Timeouts en conexiones a base de datos.',
    'Errores de conexión intermitentes.',
  ],
  hardware_fault: [
    'Alerta de hardware detectada.',
    'Servidor no responde a health check.',
  ],
};

const EVENT_DEFS = [
  { type: 'traffic_spike',   weight: 3, targets: ['web'],      peakOnly: true },
  { type: 'memory_leak',     weight: 2.5, targets: ['backend', 'web'], persistent: true },
  { type: 'slow_queries',    weight: 3, targets: ['database'], persistent: true },
  { type: 'bad_deploy',      weight: 2.5, targets: ['backend'], persistent: true },
  { type: 'disk_filling',    weight: 2.5, targets: ['web', 'backend', 'database'], persistent: true },
  { type: 'ddos',            weight: 1.5, targets: ['web'],    peakOnly: true },
  { type: 'connection_pool', weight: 2, targets: ['database'], persistent: true },
  { type: 'hardware_fault',  weight: 0.8, targets: ['web', 'backend', 'database'] },
];

function pickEvent(state) {
  const hour = state.gameTime.hour;
  const isPeak = hour >= 8 && hour <= 20;
  const eligible = EVENT_DEFS.filter(e => !e.peakOnly || isPeak);
  const total = eligible.reduce((a, e) => a + e.weight, 0);
  let r = Math.random() * total;
  for (const e of eligible) { r -= e.weight; if (r <= 0) return e; }
  return eligible[0];
}

function hasExistingIssue(state, serverId, type) {
  const s = state.servers.find(x => x.id === serverId);
  return s && s.issues.some(i => i.type === type);
}

function applyEvent(state, eventDef) {
  const msg = pick(INC_MSGS[eventDef.type] || ['Alerta detectada.']);
  const eid = state.eventIdCounter++;
  const iid = state.issueIdCounter++;

  const candidates = state.servers.filter(s =>
    !s.down && !s.rebooting &&
    eventDef.targets.includes(s.type) &&
    !hasExistingIssue(state, s.id, eventDef.type)
  );
  if (candidates.length === 0) return;
  const target = pick(candidates);

  const level = eventDef.type === 'hardware_fault' ? 'critical' : 'warning';
  addLog(state, `[ALERTA] ${target.name} (${target.ip}): ${msg}`, level);

  const issue = {
    id: iid,
    type: eventDef.type,
    description: msg,
    severity: level === 'critical' ? 'critical' : 'warning',
    startTick: state.gameTime.totalHours,
    persistent: !!eventDef.persistent,
  };

  switch (eventDef.type) {
    case 'traffic_spike':
      target.usage.cpuPercent = clamp(target.usage.cpuPercent + rng(25, 45), 0, 99);
      issue.persistent = false;
      issue.ticksLeft = Math.floor(rng(2, 5));
      break;
    case 'memory_leak':
      issue.ratePerTick = rng(0.1, 0.25);
      break;
    case 'slow_queries':
      issue.ratePerTick = 0;
      break;
    case 'bad_deploy':
      issue.deployVersion = `v${Math.floor(rng(2, 5))}.${Math.floor(rng(0, 9))}.${Math.floor(rng(0, 20))}`;
      break;
    case 'disk_filling':
      issue.ratePerTick = rng(0.2, 0.6);
      issue.cause = pick(['broken_cron', 'log_rotation', 'temp_files', 'core_dumps']);
      break;
    case 'ddos':
      issue.ticksLeft = Math.floor(rng(3, 8));
      break;
    case 'connection_pool':
      break;
    case 'hardware_fault':
      issue.persistent = false;
      issue.hwType = pick(['ram_ecc', 'disk_smart', 'nic_errors', 'psu_warning']);
      break;
  }

  target.issues.push(issue);

  state.activeEvents.push({
    id: eid,
    type: eventDef.type,
    target: target.id,
    targetName: target.name,
    issueId: iid,
    msg,
    severity: issue.severity,
    resolved: false,
  });
}

module.exports = { pickEvent, applyEvent };
