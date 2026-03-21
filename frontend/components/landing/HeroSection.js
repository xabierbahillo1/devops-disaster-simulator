import TerminalLine from './TerminalLine';

const FEATURES = [
  { icon: '⬡', label: 'Infraestructura', desc: 'Servidores web, backend y BBDD' },
  { icon: '⚠', label: 'Incidencias', desc: 'Memory leaks, DDoS, deploys rotos' },
  { icon: '★', label: 'Clientes', desc: 'SLAs exigentes, penalizaciones reales' },
  { icon: '$', label: 'Economía', desc: 'Balance, costes, quiebra' },
];

export default function HeroSection({ onPlay, onRanking }) {
  return (
    <section className="landing-hero">
      <div className="landing-logo-mark">
        <svg width="56" height="56" viewBox="0 0 56 56">
          <polygon points="28,4 52,16 52,40 28,52 4,40 4,16" fill="none" stroke="#00ff88" strokeWidth="1.5" opacity="0.5" />
          <polygon points="28,10 46,20 46,36 28,46 10,36 10,20" fill="none" stroke="#00ff88" strokeWidth="1" opacity="0.3" />
          <circle cx="28" cy="28" r="6" fill="#00ff88" opacity="0.9" />
          <circle cx="28" cy="28" r="10" fill="none" stroke="#00ff8844" strokeWidth="1" />
        </svg>
      </div>

      <h1 className="landing-title">
        <span className="landing-title-main">DEVOPS DISASTER</span>
        <span className="landing-title-sub">SIMULATOR</span>
      </h1>

      <div className="landing-terminal">
        <div className="landing-terminal-line">
          <span className="landing-prompt">$</span>{' '}
          <TerminalLine text="Gestiona servidores. Resuelve incidencias. Sobrevive." delay={600} />
        </div>
      </div>

      <div className="landing-features">
        {FEATURES.map((f, i) => (
          <div key={i} className="landing-feature" style={{ animationDelay: `${0.8 + i * 0.12}s` }}>
            <span className="landing-feature-icon">{f.icon}</span>
            <div>
              <div className="landing-feature-label">{f.label}</div>
              <div className="landing-feature-desc">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="landing-cta-area">
        <div className="landing-buttons">
          <button className="landing-btn-play" onClick={onPlay}>
            <span className="landing-btn-play-text">JUGAR</span>
            <span className="landing-btn-play-arrow">▸</span>
          </button>
          <button className="landing-btn-ranking" onClick={onRanking}>
            RANKING
          </button>
        </div>
      </div>
    </section>
  );
}
