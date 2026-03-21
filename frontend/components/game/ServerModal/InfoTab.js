import ProgressBar from '../../ui/ProgressBar';

export default function InfoTab({ server, onAction, onSwitchToScale }) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <div style={{ fontSize: 11, color: '#5a7898', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <span>{server.specs.cpuCores} vCPU</span>
        <span>{server.specs.ramGB} GB RAM</span>
        <span>{server.specs.diskGB} GB Disco</span>
        <span style={{ marginLeft: 'auto', color: '#7090b0' }}>
          ${server.costPerHour.toFixed(3)}/h (${(server.costPerHour * 730).toFixed(0)}/mes)
        </span>
      </div>

      {server.rebooting ? (
        <div style={{ color: '#ffaa00', fontSize: 13, textAlign: 'center', padding: '16px 0', letterSpacing: '0.1em' }}>
          ⟳ REINICIANDO...
        </div>
      ) : server.down ? (
        <div style={{ color: '#ff3366', fontSize: 13, textAlign: 'center', padding: '16px 0', letterSpacing: '0.1em' }}>
          ✖ NODO INACCESIBLE
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <ProgressBar label="CPU" value={server.usage.cpuPercent} max={100} unit="%" color="#00c8ff" />
          <ProgressBar label="RAM" value={server.usage.ramUsedGB} max={server.specs.ramGB} unit=" GB" color="#a855f7" />
          <ProgressBar label="DISCO" value={server.usage.diskUsedGB} max={server.specs.diskGB} unit=" GB" color="#00ff88" />
        </div>
      )}

      {server.issues && server.issues.length > 0 && (
        <div>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: '#7090b0', letterSpacing: '0.12em', marginBottom: 6 }}>
            ISSUES DETECTADOS
          </div>
          <div className="flex flex-wrap gap-2">
            {server.issues.map(issue => (
              <span key={issue.id} style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 3,
                background: issue.severity === 'critical' ? '#ff336622' : '#ffaa0018',
                color: issue.severity === 'critical' ? '#ff3366' : '#ffaa00',
                border: `1px solid ${issue.severity === 'critical' ? '#ff336644' : '#ffaa0033'}`,
              }}>
                {issue.type.replace(/_/g, ' ')}
                {issue.devFixInProgress && (
                  <span style={{ color: '#00c8ff', marginLeft: 4 }}>
                    (dev {issue.devFixHoursLeft ? `~${issue.devFixHoursLeft}h` : '⟳'})
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ borderTop: '1px solid #1a2840', paddingTop: 12 }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: '#7090b0', letterSpacing: '0.12em', marginBottom: 8 }}>
          ACCIONES
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-action btn-restart"
            onClick={() => onAction('restart', server.id)}
            disabled={server.rebooting}
            style={server.rebooting ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
          >
            ↺ Reiniciar
          </button>
          <button className="btn-action btn-scale" onClick={onSwitchToScale}>
            ↑ Escalar
          </button>
          <button className="btn-action btn-warn" onClick={() => onAction('purge_logs', server.id)}>
            🗑 Purgar Logs
          </button>
          <button className="btn-action btn-warn" onClick={() => onAction('rollback', server.id)}>
            ⟲ Rollback
          </button>
          <button className="btn-action btn-danger" onClick={() => onAction('block_traffic', server.id)}>
            ⊘ Bloquear Tráfico
          </button>
          <button className="btn-action btn-restart" onClick={() => onAction('report_bug', server.id)}>
            ⊙ Reportar Bug
          </button>
        </div>
      </div>
    </div>
  );
}
