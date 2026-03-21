const { SCALE_INSTABILITY_CHANCE } = require('./constants');
const { clamp, rng } = require('./helpers');
const { addLog } = require('./logging');
const { updateServerStatus } = require('./status');

function processIssues(state) {
  state.servers.forEach(s => {
    if (s.down && !s.rebooting) return;

    s.issues.forEach(issue => {
      switch (issue.type) {
        case 'memory_leak':
          if (!s.down) {
            s.usage.ramUsedGB = clamp(s.usage.ramUsedGB + (issue.ratePerTick || 0.15), 0, s.specs.ramGB * 0.99);
            const ramPctNow = (s.usage.ramUsedGB / s.specs.ramGB) * 100;
            if (ramPctNow >= 95) {
              issue.severity = 'critical';
              if (!issue.oomLogged) {
                addLog(state, `[OOM] ${s.name}: Proceso terminado por OOM killer — servicio inestable`, 'critical');
                issue.oomLogged = true;
              }
            } else {
              issue.severity = 'warning';
              issue.oomLogged = false;
            }
          }
          break;

        case 'disk_filling':
          s.usage.diskUsedGB = clamp(s.usage.diskUsedGB + (issue.ratePerTick || 0.3), 0, s.specs.diskGB * 0.99);
          const diskPctNow = (s.usage.diskUsedGB / s.specs.diskGB) * 100;
          if (diskPctNow >= 95) {
            issue.severity = 'critical';
            if (!issue.diskFullLogged) {
              addLog(state, `[DISCO] ${s.name}: Espacio insuficiente — escrituras fallando`, 'critical');
              issue.diskFullLogged = true;
            }
          } else {
            issue.severity = 'warning';
            issue.diskFullLogged = false;
          }
          break;

        case 'slow_queries':
          if (!s.down) {
            s.usage.cpuPercent = clamp(s.usage.cpuPercent + rng(5, 15), 0, 99);
            issue.severity = s.usage.cpuPercent >= 90 ? 'critical' : 'warning';
          }
          break;

        case 'bad_deploy':
          if (!s.down) {
            s.usage.cpuPercent = clamp(s.usage.cpuPercent + rng(10, 25), 0, 99);
            s.usage.ramUsedGB = clamp(s.usage.ramUsedGB + rng(0.1, 0.3), 0, s.specs.ramGB * 0.99);
            const bdCpu = s.usage.cpuPercent;
            const bdRamPct = (s.usage.ramUsedGB / s.specs.ramGB) * 100;
            const bdMaxLoad = Math.max(bdCpu, bdRamPct);
            issue.severity = bdMaxLoad >= 85 ? 'critical' : 'warning';
            if (bdMaxLoad >= 85 && Math.random() < 0.2) {
              s.down = true;
              addLog(state, `[CRASH] ${s.name}: Proceso caído por sobrecarga — reinicio automático`, 'critical');
              s.rebooting = true;
              s.rebootTicksLeft = 1;
            }
          }
          break;

        case 'traffic_spike':
          if (!s.down && s.type === 'web') {
            s.usage.cpuPercent = clamp(s.usage.cpuPercent + rng(10, 25), 0, 99);
          }
          if (issue.ticksLeft !== undefined) {
            issue.ticksLeft--;
            if (issue.ticksLeft <= 0) issue._remove = true;
          }
          break;

        case 'ddos':
          if (!s.down && s.type === 'web') {
            s.usage.cpuPercent = clamp(s.usage.cpuPercent + rng(20, 40), 0, 99);
          }
          if (issue.ticksLeft !== undefined) {
            issue.ticksLeft--;
            if (issue.ticksLeft <= 0) issue._remove = true;
          }
          break;

        case 'connection_pool':
          if (!s.down && s.type === 'database') {
            s.usage.cpuPercent = clamp(s.usage.cpuPercent + rng(5, 10), 0, 99);
          }
          break;

        case 'hardware_fault':
          if (!s.down) {
            s.down = true;
            addLog(state, `[HARDWARE] ${s.name}: Servidor no responde`, 'critical');
          }
          break;
      }

      // Cuenta atras del fix de desarrollo
      if (issue.devFixTicksLeft !== undefined && issue.devFixTicksLeft > 0) {
        issue.devFixTicksLeft--;
        if (issue.devFixTicksLeft <= 0) {
          issue._remove = true;
          addLog(state, `[DEV] Parche desplegado en ${s.name} — fix aplicado`, 'success');
          state.activeEvents.forEach(ev => {
            if (ev.target === s.id && ev.issueId === issue.id && !ev.resolved) {
              ev.resolved = true;
              ev._resolvedAt = state.gameTime.totalHours;
            }
          });
        }
      }
    });

    // Expiracion automatica del bloqueo de trafico
    if (s._trafficBlocked && s._trafficBlockTicksLeft !== undefined) {
      s._trafficBlockTicksLeft--;
      if (s._trafficBlockTicksLeft <= 0) {
        s._trafficBlocked = false;
        delete s._trafficBlockTicksLeft;
        addLog(state, `[RED] Bloqueo de tráfico expirado en ${s.name}`, 'info');
      }
    }

    // Efecto del bloqueo de trafico en CPU
    if (s._trafficBlocked && !s.down) {
      s.usage.cpuPercent = clamp(s.usage.cpuPercent * 0.3, 3, 99);
    }

    // Inestabilidad post-escalado
    if (s._scaleInstabilityTicks && s._scaleInstabilityTicks > 0) {
      s._scaleInstabilityTicks--;
      if (!s.down && Math.random() < SCALE_INSTABILITY_CHANCE) {
        s.usage.cpuPercent = clamp(s.usage.cpuPercent + rng(15, 30), 0, 99);
        if (Math.random() < 0.08) {
          s.down = true;
          s.rebooting = true;
          s.rebootTicksLeft = 1;
          addLog(state, `[INESTABILIDAD] ${s.name}: Crash post-escalado — reinicio automático`, 'critical');
        }
      }
    }

    s.issues = s.issues.filter(i => !i._remove);
  });
}

function processReboots(state) {
  state.servers.forEach(s => {
    if (s.rebooting && s.rebootTicksLeft > 0) {
      s.rebootTicksLeft--;
      if (s.rebootTicksLeft <= 0) {
        s.rebooting = false;
        s.down = false;
        s.uptimeHours = 0;

        s.usage.cpuPercent = rng(5, 15);
        s.usage.ramUsedGB = rng(0.3, 0.8);

        addLog(state, `[REINICIO] ${s.name} operativo`, 'success');
        updateServerStatus(s);
      }
    }
  });
}

module.exports = { processIssues, processReboots };
