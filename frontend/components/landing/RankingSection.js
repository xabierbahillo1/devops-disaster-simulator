'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { fetchRanking } from '../../lib/api';

const RANK_COLORS = ['#ffcc00', '#b0b0b0', '#cd7f32'];

export default function RankingSection({ onBack }) {
  const ref = useRef(null);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const debounceRef = useRef(null);

  const loadRanking = useCallback(async (p, s) => {
    setLoading(true);
    try {
      const data = await fetchRanking({ page: p, search: s });
      if (data.success) {
        setRanking(data.ranking);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch {
      /* silenciar errores de red */
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial y cuando cambia página o búsqueda
  useEffect(() => {
    loadRanking(page, search);
  }, [page, search, loadRanking]);

  // Scroll al montar
  useEffect(() => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  // Debounce de búsqueda
  const handleSearchInput = (value) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setSearch(value);
    }, 350);
  };

  const goPage = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  return (
    <section ref={ref} className="landing-ranking">
      <div className="landing-ranking-inner">
        <h2 className="landing-ranking-title">RANKING</h2>
        <p className="landing-ranking-sub">Los mejores operadores de infraestructura</p>

        {/* Buscador */}
        <div className="rk-search-wrap">
          <svg className="rk-search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <line x1="12.5" y1="12.5" x2="18" y2="18" />
          </svg>
          <input
            className="rk-search-input"
            type="text"
            placeholder="Buscar jugador..."
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            spellCheck={false}
          />
          {searchInput && (
            <button
              className="rk-search-clear"
              onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
            >
              &times;
            </button>
          )}
        </div>

        {/* Tabla */}
        {loading && ranking.length === 0 ? (
          <div className="rk-empty">Cargando ranking...</div>
        ) : ranking.length === 0 ? (
          <div className="rk-empty">
            {search ? `Sin resultados para "${search}"` : 'No hay partidas terminadas aún.'}
          </div>
        ) : (
          <div className="landing-ranking-table" style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            <div className="landing-ranking-header">
              <span className="landing-rk-col rk-pos">#</span>
              <span className="landing-rk-col rk-nick">Jugador</span>
              <span className="landing-rk-col rk-stat">Días</span>
              <span className="landing-rk-col rk-stat">Uptime</span>
              <span className="landing-rk-col rk-stat">Balance</span>
            </div>
            {ranking.map((r) => {
              const globalIdx = r.rank - 1;
              return (
                <div
                  key={`${r.nick}-${r.rank}`}
                  className={`landing-ranking-row ${globalIdx < 3 && !search ? 'top3' : ''}`}
                  style={{ animationDelay: `${(r.rank - ((page - 1) * 8) - 1) * 0.06}s` }}
                >
                  <span
                    className="landing-rk-col rk-pos"
                    style={{ color: (!search && globalIdx < 3) ? RANK_COLORS[globalIdx] : '#5a7898' }}
                  >
                    {r.rank}
                  </span>
                  <span
                    className="landing-rk-col rk-nick"
                    style={{ color: (!search && globalIdx < 3) ? '#c8dcea' : '#7090b0' }}
                  >
                    {r.nick}
                  </span>
                  <span className="landing-rk-col rk-stat">{r.days}</span>
                  <span
                    className="landing-rk-col rk-stat"
                    style={{ color: r.uptime >= 99.5 ? '#00ff88' : r.uptime >= 99 ? '#ffaa00' : '#ff3366' }}
                  >
                    {r.uptime}%
                  </span>
                  <span
                    className="landing-rk-col rk-stat"
                    style={{ color: r.balance >= 0 ? '#00ff88' : '#ff3366' }}
                  >
                    ${r.balance.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="rk-pagination">
            <button
              className="rk-page-btn"
              disabled={page <= 1}
              onClick={() => goPage(page - 1)}
            >
              &lsaquo;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === '...' ? (
                  <span key={`dots-${idx}`} className="rk-page-dots">&hellip;</span>
                ) : (
                  <button
                    key={item}
                    className={`rk-page-btn ${item === page ? 'rk-page-active' : ''}`}
                    onClick={() => goPage(item)}
                  >
                    {item}
                  </button>
                )
              )}

            <button
              className="rk-page-btn"
              disabled={page >= totalPages}
              onClick={() => goPage(page + 1)}
            >
              &rsaquo;
            </button>

            <span className="rk-page-info">
              {total} partida{total !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        <button className="landing-btn-ranking" onClick={onBack} style={{ marginTop: 32 }}>
          &larr; Volver
        </button>
      </div>
    </section>
  );
}
