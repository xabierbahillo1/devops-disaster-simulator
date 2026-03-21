import { STATUS_COLOR, STATUS_LABEL } from '../../constants/status';

export default function ServiceCard({ service }) {
  const color = STATUS_COLOR[service.status] || '#00ff88';

  return (
    <div
      className="panel flex items-center gap-2 px-3 py-2"
      style={{
        borderColor: service.status === 'red' ? '#ff336633' : service.status === 'yellow' ? '#ffaa0022' : '#142030',
        transition: 'border-color 0.4s',
      }}
    >
      <span className="dot" style={{ background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: '#c8dcea', flex: 1, letterSpacing: '0.02em' }}>
        {service.name}
      </span>
      <span style={{ fontSize: 10, color: '#5a7898' }}>
        {service.mode === 'ha' ? '(HA)' : ''}
      </span>
      <span style={{ fontSize: 10, color, fontWeight: 500 }}>
        {STATUS_LABEL[service.status]}
      </span>
    </div>
  );
}
