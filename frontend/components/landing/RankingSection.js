'use client';

import { useRef, useEffect } from 'react';
import { RANKING_DATA, RANK_COLORS } from '../../constants/ranking';

export default function RankingSection({ onBack }) {
  const ref = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  return (
    <section ref={ref} className="landing-ranking">
      <div className="landing-ranking-inner">
        <h2 className="landing-ranking-title">RANKING</h2>
        <p className="landing-ranking-sub">Los mejores operadores de infraestructura</p>

        <div className="landing-ranking-table">
          <div className="landing-ranking-header">
            <span className="landing-rk-col rk-pos">#</span>
            <span className="landing-rk-col rk-nick">Jugador</span>
            <span className="landing-rk-col rk-stat">Días</span>
            <span className="landing-rk-col rk-stat">Uptime</span>
            <span className="landing-rk-col rk-stat">Balance</span>
            <span className="landing-rk-col rk-stat rk-hide-mobile">Clientes</span>
          </div>
          {RANKING_DATA.map((r, i) => (
            <div
              key={r.rank}
              className={`landing-ranking-row ${i < 3 ? 'top3' : ''}`}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <span className="landing-rk-col rk-pos" style={{ color: RANK_COLORS[i] || '#5a7898' }}>
                {r.rank}
              </span>
              <span className="landing-rk-col rk-nick" style={{ color: i < 3 ? '#c8dcea' : '#7090b0' }}>
                {r.nick}
              </span>
              <span className="landing-rk-col rk-stat">{r.days}</span>
              <span className="landing-rk-col rk-stat" style={{ color: r.uptime >= 99.5 ? '#00ff88' : r.uptime >= 99 ? '#ffaa00' : '#ff3366' }}>
                {r.uptime}%
              </span>
              <span className="landing-rk-col rk-stat" style={{ color: r.balance >= 0 ? '#00ff88' : '#ff3366' }}>
                ${r.balance.toLocaleString()}
              </span>
              <span className="landing-rk-col rk-stat rk-hide-mobile">{r.clients}</span>
            </div>
          ))}
        </div>

        <button className="landing-btn-ranking" onClick={onBack} style={{ marginTop: 32 }}>
          ← Volver
        </button>
      </div>
    </section>
  );
}
