export default function ResetDialog({ onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 350,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#0b1421', border: '1px solid #1e3048', borderRadius: 8,
        padding: 24, maxWidth: 380, width: '100%',
        boxShadow: '0 0 40px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, color: '#ffaa00', letterSpacing: '0.12em', marginBottom: 12 }}>
          SALIR
        </div>
        <p style={{ fontSize: 13, color: '#c8dcea', lineHeight: 1.6, margin: '0 0 20px' }}>
          Se perderá todo el progreso actual: servidores, clientes, balance y métricas.<br />
          ¿Seguro que quieres salir?
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-action" onClick={onCancel} style={{ fontSize: 12, padding: '7px 18px' }}>
            Cancelar
          </button>
          <button className="btn-reset" onClick={onConfirm} style={{ fontSize: 12, padding: '7px 18px' }}>
            Sí, salir
          </button>
        </div>
      </div>
    </div>
  );
}
