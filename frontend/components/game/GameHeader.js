import OverallStatus from './OverallStatus';
import HudBar from './HudBar';

export default function GameHeader({ data, nickname, onExit }) {
  return (
    <header className="game-header" style={{ background: '#08111c', borderBottom: '1px solid #142030', flexShrink: 0 }}>
      <div className="game-header-top">
        <div className="flex items-center gap-2 shrink-0">
          <svg width="20" height="20" viewBox="0 0 22 22" className="shrink-0">
            <polygon points="11,2 20,7 20,15 11,20 2,15 2,7" fill="none" stroke="#00ff88" strokeWidth="1.5" />
            <circle cx="11" cy="11" r="3" fill="#00ff88" />
            <circle cx="11" cy="11" r="5" fill="none" stroke="#00ff8844" strokeWidth="1" />
          </svg>
          <div className="hidden sm:block">
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, fontWeight: 700, color: '#00ff88', letterSpacing: '0.25em', lineHeight: 1.1, textShadow: '0 0 12px #00ff8866' }}>
              DEVOPS DISASTER
            </div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 8, color: '#7090b0', letterSpacing: '0.15em' }}>
              SIMULATOR
            </div>
          </div>
        </div>

        <div className="hidden md:block w-px h-8 shrink-0" style={{ background: '#142030' }} />
        <OverallStatus services={data.services || []} />

        <div className="flex items-center gap-2 ml-auto shrink-0">
          <span className="hidden sm:inline" style={{ fontSize: 11, color: '#5a7898', fontFamily: 'monospace' }}>
            <span style={{ color: '#3a5068' }}>▸ </span>{nickname}
          </span>
          <button className="btn-reset" onClick={onExit}>SALIR</button>
        </div>
      </div>

      <HudBar gameTime={data.gameTime} uptime={data.uptime} finance={data.finance} />
    </header>
  );
}
