import StatusDot from '../ui/StatusDot';

export default function OverallStatus({ services }) {
  const anyDown     = services.some(s => s.status === 'red');
  const anyDegraded = services.some(s => s.status === 'yellow');
  const color = anyDown ? '#ff3366' : anyDegraded ? '#ffaa00' : '#00ff88';
  const label = anyDown ? 'CAÍDO' : anyDegraded ? 'DEGRADADO' : 'OPERATIVO';

  return (
    <div className="flex items-center gap-2">
      <StatusDot color={color} />
      <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, color, letterSpacing: '0.12em' }}>
        {label}
      </span>
    </div>
  );
}
