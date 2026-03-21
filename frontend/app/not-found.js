export default function NotFound() {
  return (
    <div className="grid-bg" style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16, background: '#060b12',
    }}>
      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 48, color: '#ff3366', letterSpacing: '0.2em' }}>
        404
      </div>
      <div style={{ fontSize: 14, color: '#5a7898', letterSpacing: '0.1em' }}>
        PÁGINA NO ENCONTRADA
      </div>
      <a href="/" style={{
        marginTop: 16, fontFamily: 'Orbitron, monospace', fontSize: 11,
        color: '#00c8ff', border: '1px solid #00c8ff44', borderRadius: 4,
        padding: '8px 20px', textDecoration: 'none',
      }}>
        ← VOLVER AL INICIO
      </a>
    </div>
  );
}
