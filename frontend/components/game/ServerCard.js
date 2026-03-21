import { STATUS_COLOR } from '../../constants/status';
import { TYPE_ICON } from '../../constants/server';
import ProgressBar from '../ui/ProgressBar';

export default function ServerCard({ server, onOpen }) {
  const color = STATUS_COLOR[server.status] || '#00ff88';
  const hasIssues = server.issues && server.issues.length > 0;

  return (
    <div
      className="panel flex flex-col cursor-pointer"
      onClick={() => onOpen(server.id)}
      style={{
        borderColor: server.status === 'red' ? '#ff336644' : server.status === 'yellow' ? '#ffaa0033' : '#142030',
        boxShadow: server.status === 'red' ? '0 0 12px #ff336622' : 'none',
        transition: 'border-color 0.4s, box-shadow 0.4s, transform 0.15s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = color + '66'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = server.status === 'red' ? '#ff336644' : server.status === 'yellow' ? '#ffaa0033' : '#142030'}
    >
      <div className="panel-header" style={{ gap: 6, padding: '6px 10px 5px' }}>
        <span style={{ color, fontSize: 13 }}>{TYPE_ICON[server.type] || '◆'}</span>
        <span style={{ color, letterSpacing: '0.1em', fontSize: 11 }}>{server.name}</span>
        <span className="dot ml-auto" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
        <span style={{ color, fontSize: 9 }}>
          {server.rebooting ? 'REINICIANDO' : server.down ? 'INACTIVO' : server.status === 'green' ? 'OK' : server.status === 'yellow' ? 'ALERTA' : 'CRÍTICO'}
        </span>
      </div>

      <div className="flex flex-col gap-1 p-2">
        {server.rebooting ? (
          <div style={{ color: '#ffaa00', fontSize: 11, textAlign: 'center', padding: '4px 0' }}>
            ⟳ REINICIANDO...
          </div>
        ) : server.down ? (
          <div style={{ color: '#ff3366', fontSize: 11, textAlign: 'center', padding: '4px 0' }}>
            ✖ INACCESIBLE
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1">
              <span style={{ width: 24, fontSize: 10, color: '#5a7898' }}>CPU</span>
              <ProgressBar value={server.usage.cpuPercent} max={100} unit="%" color="#00c8ff" compact />
            </div>
            <div className="flex items-center gap-1">
              <span style={{ width: 24, fontSize: 10, color: '#5a7898' }}>RAM</span>
              <ProgressBar value={server.usage.ramUsedGB} max={server.specs.ramGB} unit="G" color="#a855f7" compact />
            </div>
            <div className="flex items-center gap-1">
              <span style={{ width: 24, fontSize: 10, color: '#5a7898' }}>DSK</span>
              <ProgressBar value={server.usage.diskUsedGB} max={server.specs.diskGB} unit="G" color="#00ff88" compact />
            </div>
          </>
        )}
      </div>

      {hasIssues && (
        <div style={{ padding: '0 8px 4px', display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {server.issues.map(issue => (
            <span key={issue.id} style={{
              fontSize: 8, padding: '1px 5px', borderRadius: 2,
              background: issue.severity === 'critical' ? '#ff336622' : '#ffaa0018',
              color: issue.severity === 'critical' ? '#ff3366' : '#ffaa00',
              border: `1px solid ${issue.severity === 'critical' ? '#ff336644' : '#ffaa0033'}`,
            }}>
              {issue.type.replace(/_/g, ' ')}
              {issue.devFixInProgress && ' ⟳'}
            </span>
          ))}
        </div>
      )}

      <div style={{ padding: '4px 8px 6px', borderTop: '1px solid #142030' }}>
        <button className="btn-action btn-restart" style={{ width: '100%', fontSize: 10 }}
          onClick={(e) => { e.stopPropagation(); onOpen(server.id); }}
        >
          ▸ Entrar
        </button>
      </div>
    </div>
  );
}
