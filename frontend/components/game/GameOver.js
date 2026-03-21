export default function GameOver({ reason, fin, gt, clients, onReset }) {
  if (!reason) return null;

  const balance = Math.round((fin.totalRevenue || 0) - (fin.totalCost || 0));
  const activeCount = (clients || []).filter(c => !c.churned).length;
  const churnedCount = (clients || []).filter(c => c.churned).length;

  const config = {
    bankrupt: {
      title: 'QUIEBRA',
      color: '#ff3366',
      glow: '#ff336666',
      description: (
        <>
          Tu empresa ha acumulado demasiadas pérdidas.<br />
          Balance: <span style={{ color: '#ff3366', fontWeight: 700 }}>${balance}</span><br />
          Los acreedores han intervenido la empresa.
        </>
      ),
    },
    no_clients: {
      title: 'SIN CLIENTES',
      color: '#ff8c00',
      glow: '#ff8c0066',
      description: (
        <>
          Todos los clientes han abandonado la empresa.<br />
          Sin ingresos, es imposible continuar operando.<br />
          Balance final: <span style={{ color: '#ff8c00', fontWeight: 700 }}>${balance}</span>
        </>
      ),
    },
  };

  const { title, color, glow, description } = config[reason];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 400,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 20,
    }}>
      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 28, color, letterSpacing: '0.3em', textShadow: `0 0 30px ${glow}` }}>
        {title}
      </div>
      <div style={{ fontSize: 14, color: '#8090b0', textAlign: 'center', maxWidth: 400, lineHeight: 1.8 }}>
        {description}
      </div>
      <div style={{ fontSize: 12, color: '#5a7898', textAlign: 'center' }}>
        Día {gt.day} — {activeCount} clientes activos, {churnedCount} perdidos
      </div>
      <button className="btn-reset" onClick={onReset} style={{ fontSize: 14, padding: '10px 30px' }}>
        ↺ INTENTAR DE NUEVO
      </button>
    </div>
  );
}
