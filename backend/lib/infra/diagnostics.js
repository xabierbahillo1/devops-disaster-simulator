const { formatGameTime, rng } = require('../core/helpers');

function getServerDiagnostics(state, serverId) {
  const s = state.servers.find(x => x.id === serverId);
  if (!s) return null;

  if (s.down && !s.rebooting) {
    return { connected: false, output: `ssh: connect to host ${s.ip} port 22: Connection refused` };
  }
  if (s.rebooting) {
    return { connected: false, output: `ssh: connect to host ${s.ip} port 22: Connection timed out\n(servidor reiniciándose)` };
  }

  const lines = [];
  const ramPct = Math.round((s.usage.ramUsedGB / s.specs.ramGB) * 100);
  const diskPct = Math.round((s.usage.diskUsedGB / s.specs.diskGB) * 100);

  lines.push(`Conectado a ${s.name} (${s.ip})`);
  lines.push(`${s.os} — uptime: ${Math.floor(s.uptimeHours / 24)}d ${s.uptimeHours % 24}h`);
  lines.push('');

  lines.push('$ top -bn1 | head -20');
  lines.push(`Load average: ${(s.usage.cpuPercent / 25).toFixed(2)}, ${(s.usage.cpuPercent / 28).toFixed(2)}, ${(s.usage.cpuPercent / 32).toFixed(2)}`);
  lines.push(`Tasks: ${Math.floor(rng(80, 200))} total, ${Math.floor(rng(1, 5))} running`);
  lines.push(`%Cpu(s): ${s.usage.cpuPercent.toFixed(1)} us, ${rng(1, 5).toFixed(1)} sy, ${rng(0, 1).toFixed(1)} ni`);
  lines.push(`MiB Mem:  ${(s.specs.ramGB * 1024).toFixed(0)} total, ${((s.specs.ramGB - s.usage.ramUsedGB) * 1024).toFixed(0)} free, ${(s.usage.ramUsedGB * 1024).toFixed(0)} used`);
  lines.push('');
  lines.push('  PID  USER     CPU%   MEM%   COMMAND');

  const procs = generateProcesses(s);
  procs.forEach(p => {
    lines.push(`  ${String(p.pid).padEnd(5)} ${p.user.padEnd(8)} ${String(p.cpu.toFixed(1)).padStart(5)}  ${String(p.mem.toFixed(1)).padStart(5)}   ${p.cmd}`);
  });
  lines.push('');

  lines.push('$ free -h');
  const swapUsed = s.issues.some(i => i.type === 'memory_leak') ? rng(0.5, 2.0) : rng(0, 0.3);
  lines.push(`              total    used    free    shared  buff/cache   available`);
  lines.push(`Mem:          ${s.specs.ramGB.toFixed(1)}G    ${s.usage.ramUsedGB.toFixed(1)}G    ${(s.specs.ramGB - s.usage.ramUsedGB).toFixed(1)}G    ${rng(0.1, 0.5).toFixed(1)}G    ${rng(0.3, 1.5).toFixed(1)}G         ${(s.specs.ramGB - s.usage.ramUsedGB - 0.5).toFixed(1)}G`);
  lines.push(`Swap:         2.0G    ${swapUsed.toFixed(1)}G    ${(2.0 - swapUsed).toFixed(1)}G`);
  lines.push('');

  lines.push('$ df -h');
  lines.push('Filesystem      Size  Used  Avail  Use%  Mounted on');
  lines.push(`/dev/sda1       ${s.specs.diskGB}G   ${s.usage.diskUsedGB.toFixed(1)}G  ${(s.specs.diskGB - s.usage.diskUsedGB).toFixed(1)}G   ${diskPct}%   /`);
  lines.push(`tmpfs           ${(s.specs.ramGB / 2).toFixed(1)}G   ${rng(0, 0.1).toFixed(1)}G   ${(s.specs.ramGB / 2).toFixed(1)}G    0%   /dev/shm`);
  lines.push('');

  if (s.issues.some(i => i.type === 'disk_filling') || diskPct > 70) {
    lines.push('$ du -sh /var/log/* /tmp/* 2>/dev/null | sort -rh | head -10');
    const diskIssue = s.issues.find(i => i.type === 'disk_filling');
    if (diskIssue) {
      switch (diskIssue.cause) {
        case 'broken_cron':
          lines.push(`${(s.usage.diskUsedGB * 0.4).toFixed(1)}G    /var/log/syslog`);
          lines.push(`${(s.usage.diskUsedGB * 0.2).toFixed(1)}G    /var/log/app/access.log`);
          lines.push(`${rng(0.1, 0.5).toFixed(1)}G    /tmp/session_cache`);
          lines.push('');
          lines.push('$ crontab -l');
          lines.push('# m h dom mon dow command');
          lines.push('# 0 3 * * * /usr/local/bin/log-rotate.sh  ← COMENTADO');
          lines.push(`$ stat /usr/local/bin/log-rotate.sh`);
          lines.push(`  File: /usr/local/bin/log-rotate.sh`);
          lines.push(`  Modify: hace ${Math.floor(rng(30, 90))} días`);
          break;
        case 'log_rotation':
          lines.push(`${(s.usage.diskUsedGB * 0.5).toFixed(1)}G    /var/log/app/access.log`);
          lines.push(`${(s.usage.diskUsedGB * 0.15).toFixed(1)}G   /var/log/app/error.log`);
          lines.push(`${rng(0.2, 0.8).toFixed(1)}G    /var/log/nginx/access.log.1`);
          lines.push('');
          lines.push('$ cat /etc/logrotate.d/app');
          lines.push('/var/log/app/*.log {');
          lines.push('    rotate 0');
          lines.push('    size 100G    ← rotación configurada demasiado alta');
          lines.push('}');
          break;
        case 'temp_files':
          lines.push(`${(s.usage.diskUsedGB * 0.3).toFixed(1)}G    /tmp/upload_cache`);
          lines.push(`${(s.usage.diskUsedGB * 0.2).toFixed(1)}G    /tmp/build_artifacts`);
          lines.push(`${rng(1, 5).toFixed(1)}G    /var/log/syslog`);
          lines.push('');
          lines.push('$ ls -la /tmp/upload_cache/ | wc -l');
          lines.push(`${Math.floor(rng(5000, 50000))}`);
          lines.push('$ find /tmp/upload_cache -mtime +7 | wc -l');
          lines.push(`${Math.floor(rng(4000, 45000))}    ← archivos de hace más de 7 días sin limpiar`);
          break;
        case 'core_dumps':
          lines.push(`${(s.usage.diskUsedGB * 0.35).toFixed(1)}G   /var/crash`);
          lines.push(`${(s.usage.diskUsedGB * 0.1).toFixed(1)}G    /var/log/syslog`);
          lines.push('');
          lines.push('$ ls /var/crash/ | tail -5');
          for (let i = 0; i < 5; i++) {
            lines.push(`core.${Math.floor(rng(1000, 9999))}.${Math.floor(rng(100000, 999999))}`);
          }
          lines.push(`$ ls /var/crash/ | wc -l`);
          lines.push(`${Math.floor(rng(200, 1500))}    ← core dumps acumulándose`);
          break;
      }
    } else {
      lines.push(`${(s.usage.diskUsedGB * 0.3).toFixed(1)}G    /var/log/syslog`);
      lines.push(`${rng(0.5, 2).toFixed(1)}G    /var/log/app`);
    }
    lines.push('');
  }

  lines.push('$ journalctl --no-pager -n 8 --priority=warning');
  const syslogEntries = generateSyslog(state, s);
  syslogEntries.forEach(entry => lines.push(entry));
  lines.push('');

  if (s.issues.some(i => i.type === 'hardware_fault')) {
    const hwIssue = s.issues.find(i => i.type === 'hardware_fault');
    lines.push('$ dmesg | tail -5');
    switch (hwIssue?.hwType) {
      case 'ram_ecc':
        lines.push('[Hardware Error]: Machine check events logged');
        lines.push('[Hardware Error]: CPU 0: Machine Check: 0 Bank 7');
        lines.push('EDAC MC0: 1 CE error on DIMM0 (channel:0 slot:0)');
        break;
      case 'disk_smart':
        lines.push('[sda] FAILED Result: hostbyte=DID_OK driverbyte=DRIVER_SENSE');
        lines.push('sd 0:0:0:0: [sda] Sense Key: Medium Error [current]');
        lines.push('SMART error (CurrentPendingSector) detected');
        break;
      case 'nic_errors':
        lines.push('eth0: TX timeout, resetting adapter');
        lines.push('eth0: link down');
        lines.push('eth0: NIC Link is Down');
        break;
      case 'psu_warning':
        lines.push('ACPI: thermal: Critical temperature reached');
        lines.push('ipmi_si: Power supply redundancy degraded');
        break;
    }
    lines.push('');
  }

  if (s.issues.some(i => i.type === 'connection_pool' || i.type === 'ddos')) {
    lines.push('$ ss -s');
    if (s.issues.some(i => i.type === 'ddos')) {
      const total = Math.floor(rng(10000, 50000));
      lines.push(`Total: ${total}`);
      lines.push(`TCP:   ${total} (estab ${Math.floor(total * 0.8)}, timewait ${Math.floor(total * 0.15)})`);
      lines.push('');
      lines.push('$ ss -tn state established | awk \'{print $5}\' | cut -d: -f1 | sort | uniq -c | sort -rn | head -5');
      for (let i = 0; i < 5; i++) {
        lines.push(`   ${Math.floor(rng(500, 5000))}  ${Math.floor(rng(1, 255))}.${Math.floor(rng(1, 255))}.${Math.floor(rng(1, 255))}.${Math.floor(rng(1, 255))}`);
      }
    } else {
      lines.push(`Total: ${Math.floor(rng(100, 300))}`);
      lines.push(`TCP:   ${Math.floor(rng(80, 200))} (estab ${Math.floor(rng(50, 100))}, close-wait ${Math.floor(rng(20, 80))})`);
      lines.push('');
      lines.push('$ ss -tn state close-wait | wc -l');
      lines.push(`${Math.floor(rng(30, 100))}    ← conexiones en close-wait (no liberadas)`);
    }
    lines.push('');
  }

  if (s.issues.some(i => i.type === 'bad_deploy')) {
    const deployIssue = s.issues.find(i => i.type === 'bad_deploy');
    lines.push('$ tail -5 /var/log/app/error.log');
    lines.push(`[ERROR] Uncaught TypeError: Cannot read property 'id' of undefined`);
    lines.push(`[ERROR]     at processRequest (/app/src/handlers/user.js:142:28)`);
    lines.push(`[ERROR]     at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)`);
    lines.push(`[WARN]  Process restarted due to unhandled exception (${Math.floor(rng(3, 20))}th time)`);
    lines.push('');
    lines.push('$ git -C /app log --oneline -3');
    lines.push(`abc${Math.floor(rng(1000, 9999))} (HEAD) ${deployIssue.deployVersion} - Feature: user dashboard`);
    lines.push(`def${Math.floor(rng(1000, 9999))} v${deployIssue.deployVersion.slice(1, -1)}0 - Fix: auth middleware`);
    lines.push(`ghi${Math.floor(rng(1000, 9999))} v${deployIssue.deployVersion.slice(1, -1)}9 - Stable release`);
    lines.push('');
  }

  if (s.issues.some(i => i.type === 'memory_leak')) {
    lines.push('$ ps aux --sort=-%mem | head -5');
    lines.push('USER     PID   %CPU  %MEM    VSZ     RSS    COMMAND');
    const leakMem = (s.usage.ramUsedGB / s.specs.ramGB * 100).toFixed(1);
    if (s.type === 'backend') {
      lines.push(`app      ${Math.floor(rng(1000, 9999))}  ${rng(5, 30).toFixed(1)}  ${leakMem}  ${Math.floor(rng(800000, 2000000))}  ${Math.floor(s.usage.ramUsedGB * 1024 * 1024)}  node /app/server.js`);
    } else {
      lines.push(`www      ${Math.floor(rng(1000, 9999))}  ${rng(5, 30).toFixed(1)}  ${leakMem}  ${Math.floor(rng(400000, 1000000))}  ${Math.floor(s.usage.ramUsedGB * 0.7 * 1024 * 1024)}  nginx: worker process`);
    }
    lines.push('');
    lines.push('$ cat /proc/$(pgrep -f "node\\|nginx" | head -1)/status | grep -i vm');
    lines.push(`VmPeak:  ${Math.floor(s.usage.ramUsedGB * 1.1 * 1024 * 1024)} kB`);
    lines.push(`VmRSS:   ${Math.floor(s.usage.ramUsedGB * 1024 * 1024)} kB  ← creciendo`);
    lines.push(`VmSwap:  ${Math.floor(rng(10000, 200000))} kB`);
    lines.push('');
  }

  if (s.issues.some(i => i.type === 'slow_queries')) {
    lines.push('$ sudo -u postgres psql -c "SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 3;"');
    lines.push('                    query                    | calls | mean_time');
    lines.push('---------------------------------------------+-------+-----------');
    lines.push(` SELECT * FROM users WHERE email LIKE '%...' | ${Math.floor(rng(1000, 50000))} | ${rng(500, 5000).toFixed(1)} ms`);
    lines.push(` SELECT * FROM orders JOIN products ON...     | ${Math.floor(rng(500, 20000))}  | ${rng(200, 2000).toFixed(1)} ms`);
    lines.push(` UPDATE sessions SET last_active = NOW()...   | ${Math.floor(rng(2000, 100000))} | ${rng(50, 300).toFixed(1)} ms`);
    lines.push('');
    lines.push('$ sudo -u postgres psql -c "SELECT schemaname, relname, seq_scan, idx_scan FROM pg_stat_user_tables WHERE seq_scan > 1000;"');
    lines.push(' schemaname | relname  | seq_scan | idx_scan');
    lines.push('------------+----------+----------+----------');
    lines.push(` public     | users    | ${Math.floor(rng(5000, 50000))}   | ${Math.floor(rng(10, 100))}`);
    lines.push(` public     | sessions | ${Math.floor(rng(10000, 100000))}  | ${Math.floor(rng(50, 500))}`);
    lines.push('');
  }

  if (s._trafficBlocked) {
    lines.push('$ iptables -L INPUT -n | grep DROP');
    lines.push('DROP    all  --  0.0.0.0/0    0.0.0.0/0    ← FIREWALL ACTIVO: bloqueando tráfico');
    lines.push('');
  }

  return { connected: true, output: lines.join('\n') };
}

function generateProcesses(s) {
  const procs = [];
  let pid = 1;

  procs.push({ pid: pid++, user: 'root', cpu: 0.1, mem: 0.2, cmd: 'systemd' });
  procs.push({ pid: pid++ * 100, user: 'root', cpu: rng(0.1, 0.5), mem: rng(0.1, 0.3), cmd: 'sshd: /usr/sbin/sshd' });

  switch (s.type) {
    case 'web':
      procs.push({ pid: pid++ * 100, user: 'root', cpu: rng(0.5, 2), mem: rng(1, 3), cmd: 'nginx: master process' });
      for (let i = 0; i < s.specs.cpuCores; i++) {
        const isLeaking = s.issues.some(j => j.type === 'memory_leak');
        procs.push({
          pid: pid++ * 100 + i,
          user: 'www',
          cpu: rng(5, s.usage.cpuPercent / s.specs.cpuCores + 10),
          mem: isLeaking ? rng(15, 35) : rng(3, 10),
          cmd: 'nginx: worker process',
        });
      }
      break;
    case 'backend':
      const nodeLeaking = s.issues.some(i => i.type === 'memory_leak');
      procs.push({
        pid: pid++ * 100,
        user: 'app',
        cpu: rng(10, s.usage.cpuPercent * 0.8),
        mem: nodeLeaking ? rng(40, 80) : rng(10, 30),
        cmd: 'node /app/server.js',
      });
      procs.push({ pid: pid++ * 100, user: 'app', cpu: rng(1, 5), mem: rng(2, 8), cmd: 'node /app/worker.js' });
      break;
    case 'database':
      procs.push({
        pid: pid++ * 100,
        user: 'postgres',
        cpu: rng(5, s.usage.cpuPercent * 0.6),
        mem: rng(20, 50),
        cmd: 'postgres: main process',
      });
      const connCount = s.issues.some(i => i.type === 'connection_pool') ? Math.floor(rng(90, 100)) : Math.floor(rng(10, 40));
      for (let i = 0; i < Math.min(connCount, 5); i++) {
        procs.push({
          pid: pid++ * 100 + i,
          user: 'postgres',
          cpu: rng(1, 10),
          mem: rng(1, 5),
          cmd: s.issues.some(j => j.type === 'slow_queries')
            ? 'postgres: app idle in transaction'
            : 'postgres: app SELECT',
        });
      }
      if (connCount > 5) {
        procs.push({ pid: 0, user: '...', cpu: 0, mem: 0, cmd: `(+${connCount - 5} conexiones postgres más)` });
      }
      break;
  }

  procs.push({ pid: pid++ * 1000, user: 'root', cpu: rng(0.1, 1), mem: rng(0.5, 1.5), cmd: 'node_exporter' });

  return procs.sort((a, b) => b.cpu - a.cpu);
}

function generateSyslog(state, s) {
  const entries = [];
  const time = formatGameTime(state.gameTime);

  s.issues.forEach(issue => {
    switch (issue.type) {
      case 'memory_leak':
        entries.push(`${time} kernel: [${Math.floor(rng(10000, 99999))}.${Math.floor(rng(100, 999))}] Out of memory: Killed process ${Math.floor(rng(1000, 9999))}`);
        entries.push(`${time} systemd[1]: app.service: Main process exited, code=killed, status=9/KILL`);
        break;
      case 'bad_deploy':
        entries.push(`${time} app[${Math.floor(rng(1000, 9999))}]: Error: FATAL: unhandled rejection`);
        entries.push(`${time} systemd[1]: app.service: Scheduled restart job, restart counter is at ${Math.floor(rng(3, 20))}.`);
        break;
      case 'disk_filling':
        entries.push(`${time} kernel: EXT4-fs warning: mounting unchecked fs`);
        entries.push(`${time} rsyslogd: action 'action-f-1' suspended, no space left on device`);
        break;
      case 'ddos':
        entries.push(`${time} kernel: nf_conntrack: table full, dropping packet`);
        entries.push(`${time} nginx[${Math.floor(rng(100, 999))}]: ${Math.floor(rng(1000, 50000))} connections active, worker_connections exceeded`);
        break;
      case 'connection_pool':
        entries.push(`${time} postgres[${Math.floor(rng(100, 999))}]: FATAL: remaining connection slots reserved for superuser`);
        entries.push(`${time} postgres[${Math.floor(rng(100, 999))}]: FATAL: too many connections for role "app"`);
        break;
      case 'slow_queries':
        entries.push(`${time} postgres[${Math.floor(rng(100, 999))}]: LOG: duration: ${Math.floor(rng(2000, 15000))} ms statement: SELECT * FROM users WHERE...`);
        break;
      case 'hardware_fault':
        entries.push(`${time} kernel: mce: [Hardware Error]: Machine check events logged`);
        break;
      case 'traffic_spike':
        entries.push(`${time} nginx[${Math.floor(rng(100, 999))}]: upstream timed out (110: Connection timed out)`);
        break;
    }
  });

  if (entries.length === 0) {
    entries.push(`${time} systemd[1]: Started Session scope.`);
    entries.push(`${time} CRON[${Math.floor(rng(1000, 9999))}]: (root) CMD (test -x /usr/sbin/anacron)`);
  }

  return entries.slice(0, 8);
}

module.exports = { getServerDiagnostics };
