export default function StatsBar({ stats }) {
  if (!stats || stats.total === 0) return null;

  const pct = Math.round((stats.positive / stats.total) * 100);

  let label, labelColor;
  if (pct >= 80)      { label = 'MUY POSITIVAS'; labelColor = '#00ff88'; }
  else if (pct >= 60) { label = 'POSITIVAS';     labelColor = '#00c8ff'; }
  else if (pct >= 40) { label = 'MIXTAS';         labelColor = '#ffaa00'; }
  else                { label = 'NEGATIVAS';      labelColor = '#ff3366'; }

  return (
    <div className="rv-stats">
      <div className="rv-stat-card">
        <span className="rv-stat-label">TOTAL</span>
        <span className="rv-stat-value" style={{ color: '#c8dcea' }}>{stats.total}</span>
      </div>

      <div className="rv-stat-card" style={{ flex: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span className="rv-stat-label">VALORACION GLOBAL</span>
          <span style={{
            fontFamily: 'Orbitron, monospace', fontSize: 8, letterSpacing: '0.12em',
            color: labelColor, padding: '2px 8px',
            border: `1px solid ${labelColor}22`, borderRadius: 3,
            background: `${labelColor}0d`,
          }}>
            {label}
          </span>
        </div>
        <span className="rv-stat-value" style={{ color: labelColor }}>{pct}%</span>
        <div className="rv-stat-bar-wrap">
          <div className="rv-stat-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#00ff88' }}>
            👍 {stats.positive}
          </span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#ff3366' }}>
            {stats.negative} 👎
          </span>
        </div>
      </div>
    </div>
  );
}
