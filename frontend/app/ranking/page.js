'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { fetchRanking } from '../../lib/api';

const TOP3 = [
  { color: '#FFD700', glow: '#FFD70030', border: '#FFD70022' },
  { color: '#94A8B8', glow: '#94A8B830', border: '#94A8B820' },
  { color: '#CD7F32', glow: '#CD7F3230', border: '#CD7F3220' },
];

export default function RankingPage() {
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
      /* network error */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRanking(page, search);
  }, [page, search, loadRanking]);

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
    <div className="rk-page">
      <div className="rk-scanlines" />
      <div className="rk-bg-glow" />

      <div className="rk-container">
        {/* Navigation */}
        <nav className="rk-nav">
          <Link href="/" className="rk-back">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="13" y1="8" x2="3" y2="8" />
              <polyline points="8,3 3,8 8,13" />
            </svg>
            <span>VOLVER</span>
          </Link>
          <div className="rk-nav-status">
            <span className="rk-nav-dot" />
            <span>LIVE</span>
          </div>
        </nav>

        {/* Title */}
        <header className="rk-header">
          <div className="rk-title-pre">{'// CLASIFICACION GLOBAL'}</div>
          <h1 className="rk-title" data-text="RANKING">RANKING</h1>
          <p className="rk-subtitle">Top administradores de infraestructura</p>
          <div className="rk-title-line" />
        </header>

        {/* Search + count */}
        <div className="rk-toolbar">
          <div className="rk-search-field">
            <svg className="rk-search-ico" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <line x1="12.5" y1="12.5" x2="18" y2="18" />
            </svg>
            <input
              className="rk-search-inp"
              type="text"
              placeholder="Buscar jugador..."
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              spellCheck={false}
            />
            {searchInput && (
              <button
                className="rk-search-x"
                onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
              >
                &times;
              </button>
            )}
          </div>
          <div className="rk-toolbar-info">
            <span className="rk-total-badge">{total} partida{total !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Table */}
        <div className="rk-table-wrap">
          {loading && ranking.length === 0 ? (
            <div className="rk-empty-state">
              <div className="rk-spinner" />
              <span>Accediendo a registros...</span>
            </div>
          ) : ranking.length === 0 ? (
            <div className="rk-empty-state">
              <span className="rk-empty-icon">{'>'}_</span>
              <span>{search ? `Sin resultados para "${search}"` : 'No hay partidas terminadas aun.'}</span>
            </div>
          ) : (
            <>
              <div className="rk-table-head">
                <span className="rk-th rk-th-pos">#</span>
                <span className="rk-th rk-th-nick">Jugador</span>
                <span className="rk-th rk-th-stat">Dias</span>
                <span className="rk-th rk-th-stat">Uptime</span>
                <span className="rk-th rk-th-stat rk-th-balance">Balance</span>
              </div>
              <div className="rk-table-body" style={{ opacity: loading ? 0.35 : 1 }}>
                {ranking.map((r, i) => {
                  const isTop3 = r.rank <= 3 && !search;
                  const t3 = isTop3 ? TOP3[r.rank - 1] : null;
                  return (
                    <div
                      key={`${r.nick}-${r.rank}`}
                      className={`rk-row ${isTop3 ? 'rk-row-top3' : ''}`}
                      style={{
                        animationDelay: `${i * 0.04}s`,
                        ...(isTop3 ? {
                          borderColor: t3.border,
                          boxShadow: `inset 0 0 24px ${t3.glow}`,
                        } : {}),
                      }}
                    >
                      <span
                        className="rk-td rk-td-pos"
                        style={isTop3 ? { color: t3.color, textShadow: `0 0 8px ${t3.glow}` } : undefined}
                      >
                        {r.rank}
                      </span>
                      <span
                        className="rk-td rk-td-nick"
                        style={isTop3 ? { color: '#d8e8f4' } : undefined}
                      >
                        {r.nick}
                      </span>
                      <span className="rk-td rk-td-stat">{r.days}</span>
                      <span
                        className="rk-td rk-td-stat"
                        style={{ color: r.uptime >= 99.5 ? '#00ff88' : r.uptime >= 98 ? '#ffaa00' : '#ff4466' }}
                      >
                        {r.uptime}%
                      </span>
                      <span
                        className="rk-td rk-td-stat rk-td-balance"
                        style={{ color: r.balance >= 0 ? '#00ff88' : '#ff4466' }}
                      >
                        ${r.balance.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="rk-pag">
            <button className="rk-pag-btn" disabled={page <= 1} onClick={() => goPage(page - 1)}>
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
                  <span key={`d-${idx}`} className="rk-pag-dots">&hellip;</span>
                ) : (
                  <button
                    key={item}
                    className={`rk-pag-btn ${item === page ? 'rk-pag-active' : ''}`}
                    onClick={() => goPage(item)}
                  >
                    {item}
                  </button>
                )
              )}
            <button className="rk-pag-btn" disabled={page >= totalPages} onClick={() => goPage(page + 1)}>
              &rsaquo;
            </button>
          </div>
        )}

        <div className="rk-footer-deco">
          <span>{'<<'} DEVOPS DISASTER SIMULATOR {'>>'}</span>
        </div>
      </div>
    </div>
  );
}
