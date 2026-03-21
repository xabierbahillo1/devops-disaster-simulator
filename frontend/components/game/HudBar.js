function HudStat({ label, value, color, sub }) {
  return (
    <div className="hud-stat">
      <span className="hud-label">{label}</span>
      <span className="hud-value" style={{ color: color || '#c8dcea' }}>{value}</span>
      {sub && <span style={{ fontSize: 8, color: '#4a6880', marginTop: -1 }}>{sub}</span>}
    </div>
  );
}

export default function HudBar({ gameTime, uptime, finance }) {
  const gt = gameTime || {};
  const up = uptime || {};
  const fin = finance || {};

  const dailyBudget = fin.monthlyBudget / 30;
  const costColor   = fin.costPerDay > dailyBudget ? '#ff3366' : fin.costPerDay > dailyBudget * 0.8 ? '#ffaa00' : '#00ff88';
  const uptimeColor = up.actual >= 99.5 ? '#00ff88' : up.actual >= 98 ? '#ffaa00' : '#ff3366';
  const profitColor = (fin.totalRevenue - fin.totalCost) >= 0 ? '#00ff88' : '#ff3366';

  return (
    <div className="game-hud-bar">
      <HudStat
        label="Día / Hora"
        value={gt.formatted || '?'}
        color="#00c8ff"
        sub={gt.speed === 'slow' ? '⏸ x0.25' : gt.speed === 'reduced' ? '⏸ x0.5' : ''}
      />
      <HudStat label="Uptime" value={`${up.actual || 100}%`} color={uptimeColor} />
      <HudStat label="Infra" value={`$${(fin.costPerDay || 0).toFixed(2)}/d`} color={costColor} />
      <HudStat label="Balance" value={`$${Math.round((fin.totalRevenue || 0) - (fin.totalCost || 0))}`} color={profitColor} />
      {(fin.penalties || 0) > 0 && (
        <HudStat label="Penaliz." value={`-$${fin.penalties}`} color="#ff3366" />
      )}
    </div>
  );
}
