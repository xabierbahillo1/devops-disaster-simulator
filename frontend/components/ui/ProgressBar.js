export default function ProgressBar({ value, max, label, unit, color, compact = false }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const bg  = compact
    ? (pct >= 95 ? '#ff3366' : pct >= 80 ? '#ffaa00' : color)
    : (pct >= 90 ? '#ff3366' : pct >= 70 ? '#ffaa00' : color);

  const textColor = compact
    ? (pct >= 95 ? '#ff3366' : pct >= 80 ? '#ffaa00' : '#7090b0')
    : (pct >= 90 ? '#ff3366' : pct >= 70 ? '#ffaa00' : '#c8dcea');

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="bar-track" style={{ flex: 1 }}>
          <div className="bar-fill" style={{ width: `${pct}%`, background: bg }} />
        </div>
        <span style={{ fontSize: 10, color: textColor, whiteSpace: 'nowrap', minWidth: 30, textAlign: 'right' }}>
          {Math.round(pct)}%
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {label && (
        <span style={{ width: 36, fontSize: 11, color: '#7090b0', flexShrink: 0 }}>{label}</span>
      )}
      <div className="bar-track" style={{ height: 6 }}>
        <div className="bar-fill" style={{ width: `${pct}%`, background: bg }} />
      </div>
      <span style={{ minWidth: 80, fontSize: 11, textAlign: 'right', color: textColor, whiteSpace: 'nowrap' }}>
        {typeof value === 'number' ? (unit === '%' ? `${Math.round(value)}%` : `${value.toFixed(1)}/${max}${unit}`) : 'N/A'}
      </span>
    </div>
  );
}
