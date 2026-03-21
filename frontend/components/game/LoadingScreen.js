export default function LoadingScreen() {
  return (
    <div className="grid-bg" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 22, color: '#00ff88', letterSpacing: '0.3em', textShadow: '0 0 20px #00ff8866' }}>
        DEVOPS DISASTER SIMULATOR
      </div>
      <div style={{ fontSize: 12, color: '#4a6880', letterSpacing: '0.15em' }}>
        CONECTANDO CON BACKEND
        <span style={{ animation: 'blink 1s step-end infinite' }}>_</span>
      </div>
    </div>
  );
}
