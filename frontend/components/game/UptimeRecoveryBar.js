'use client';

const WINDOW_HOURS = 48;

export default function UptimeRecoveryBar({ uptime }) {
  const actual = uptime?.actual ?? 100;
  if (actual >= 100) return null;

  // Contar horas limpias desde la última incidencia en el historial
  const history = uptime?.history || [];
  let cleanStreak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].down > 0) break;
    cleanStreak += history[i].hours;
  }

  const fill = Math.min(cleanStreak / WINDOW_HOURS, 1) * 100;
  const cleanH = Math.round(cleanStreak);
  const color = actual >= 99.5 ? '#00ff88' : actual >= 98 ? '#ffaa00' : '#ff3366';

  return (
    <div style={{
      padding: '3px 12px 4px',
      borderTop: '1px solid #0d1f30',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 7, color: '#4a6880', letterSpacing: '0.12em', whiteSpace: 'nowrap', flexShrink: 0 }}>
        CLEAN STREAK
      </span>
      <div style={{ flex: 1, height: 3, background: '#0d1f30', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          width: `${fill}%`,
          height: '100%',
          background: color,
          borderRadius: 2,
          transition: 'width 1.5s linear',
          boxShadow: `0 0 5px ${color}66`,
        }} />
      </div>
      <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#4a6880', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {cleanH}h / {WINDOW_HOURS}h
      </span>
    </div>
  );
}
