export default function ConfirmDialog({ data, onConfirm, onCancel }) {
  if (!data) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onCancel}>
      <div className="confirm-dialog-enter" onClick={(e) => e.stopPropagation()} style={{
        background: '#0b1421', border: '1px solid #1e3048', borderRadius: 8,
        padding: 24, maxWidth: 420, width: '100%',
        boxShadow: '0 0 40px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, color: '#ffaa00', letterSpacing: '0.12em', marginBottom: 12 }}>
          CONFIRMACIÓN
        </div>
        <p style={{ fontSize: 12, color: '#c8dcea', lineHeight: 1.6, margin: '0 0 8px' }}>
          {data.message}
        </p>
        {data.estimate && (
          <div style={{ background: '#081018', border: '1px solid #1a2840', borderRadius: 4, padding: 12, marginBottom: 16, fontSize: 11 }}>
            {data.estimate.cost !== undefined && (
              <div style={{ color: '#ffaa00' }}>Coste estimado: <strong>${data.estimate.cost}</strong></div>
            )}
            {data.estimate.hours !== undefined && (
              <div style={{ color: '#7090b0' }}>Tiempo estimado: ~{data.estimate.hours}h</div>
            )}
            {data.estimate.baseCost !== undefined && (
              <div style={{ color: '#7090b0', marginTop: 8, fontSize: 10 }}>
                Desglose: ${data.estimate.baseCost} (consultoría) + {data.estimate.hours}h × ${data.estimate.hourlyRate}/h
              </div>
            )}
            {data.estimate.setupFee !== undefined && (
              <>
                <div style={{ color: '#ffaa00' }}>Setup: <strong>${data.estimate.setupFee}</strong> (pago único)</div>
                <div style={{ color: '#7090b0' }}>Coste diario: ~${Math.round(data.estimate.hourlyRate * 24)}/día</div>
                <div style={{ color: '#7090b0' }}>Specs: {data.estimate.specs.cpuCores} vCPU, {data.estimate.specs.ramGB} GB RAM, {data.estimate.specs.diskGB} GB Disco</div>
                <div style={{ color: '#7090b0' }}>Provisión: ~{data.estimate.provisionHours}h</div>
              </>
            )}
            <div style={{ color: '#5a7898', fontSize: 10, marginTop: 6, fontStyle: 'italic' }}>
              * Los costes y tiempos reales pueden variar respecto a la estimación (±30%)
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <button className="btn-action btn-scale flex-1" onClick={onConfirm}>Confirmar</button>
          <button className="btn-action btn-ignore flex-1" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
