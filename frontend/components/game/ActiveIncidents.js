import { EVENT_ICON, EVENT_BORDER } from '../../constants/events';

export default function ActiveIncidents({ events, onOpenServer }) {
  if (!events || events.length === 0) {
    return (
      <div className="panel flex items-center justify-center gap-2" style={{ padding: '14px', minHeight: 56 }}>
        <span className="dot dot-green" />
        <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, color: '#00ff8899', letterSpacing: '0.12em' }}>
          TODOS LOS SISTEMAS OPERATIVOS
        </span>
      </div>
    );
  }

  return (
    <div className="panel flex flex-col">
      <div className="panel-header">
        <span style={{ color: '#ff3366' }}>⚠</span>
        Incidentes Activos
        <span style={{
          marginLeft: 'auto', fontFamily: 'Orbitron, monospace', fontSize: 9,
          background: '#ff336622', color: '#ff3366', padding: '1px 6px',
          borderRadius: 2, border: '1px solid #ff336644',
        }}>
          {events.length}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 p-2">
        {events.map(ev => (
          <div key={ev.id} className="incident-card cursor-pointer"
            style={{ borderLeftColor: EVENT_BORDER[ev.type] || '#ffaa00' }}
            onClick={() => onOpenServer(ev.target)}
          >
            <div className="flex items-start gap-2">
              <span style={{ fontSize: 14 }}>{EVENT_ICON[ev.type] || '⚠'}</span>
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{
                    fontFamily: 'Orbitron, monospace', fontSize: 10,
                    color: EVENT_BORDER[ev.type] || '#ffaa00', letterSpacing: '0.08em',
                  }}>
                    ALERTA
                  </span>
                  <span style={{ fontSize: 11, color: '#7090b0' }}>→ {ev.targetName}</span>
                </div>
                <p style={{ fontSize: 11, color: '#8090b0', margin: 0, lineHeight: 1.4 }}>
                  {ev.msg}
                </p>
              </div>
              <span style={{
                fontSize: 9, color: '#5a7898', fontFamily: 'Orbitron, monospace',
                letterSpacing: '0.06em', flexShrink: 0,
              }}>
                INVESTIGAR ▸
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
