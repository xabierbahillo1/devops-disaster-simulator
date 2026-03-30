'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { fetchReviews } from '../../lib/api';
import StatsBar from '../../components/reviews/StatsBar';
import ReviewCard from '../../components/reviews/ReviewCard';

export default function ReviewsPage() {
  const [reviews, setReviews]       = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [filter, setFilter]         = useState('all');

  const load = useCallback(async (p, f) => {
    setLoading(true);
    try {
      const data = await fetchReviews({ page: p, filter: f });
      if (data.success) {
        setReviews(data.reviews);
        setStats(data.stats);
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
    load(page, filter);
  }, [page, filter, load]);

  const changeFilter = (f) => {
    setFilter(f);
    setPage(1);
  };

  const goPage = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  return (
    <div className="rv-page">
      <div className="rv-scanlines" />
      <div className="rv-bg-glow" />

      <div className="rv-container">
        <nav className="rv-nav">
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

        <header className="rv-header">
          <div className="rv-title-pre">{'// OPINIONES DE LA COMUNIDAD'}</div>
          <h1 className="rv-title" data-text="REVIEWS">REVIEWS</h1>
          <p className="rv-subtitle">Lo que piensan los administradores de sistemas</p>
          <div className="rv-title-line" />
        </header>

        <StatsBar stats={stats} />

        <div className="rv-filters">
          <button
            className={`rv-filter-btn ${filter === 'all' ? 'rv-filter-active' : ''}`}
            onClick={() => changeFilter('all')}
          >
            TODAS
          </button>
          <button
            className={`rv-filter-btn rv-filter-positive ${filter === 'positive' ? 'rv-filter-active' : ''}`}
            onClick={() => changeFilter('positive')}
          >
            👍 POSITIVAS
          </button>
          <button
            className={`rv-filter-btn rv-filter-negative ${filter === 'negative' ? 'rv-filter-active' : ''}`}
            onClick={() => changeFilter('negative')}
          >
            👎 NEGATIVAS
          </button>
          <span className="rv-count-badge">{total} valoracion{total !== 1 ? 'es' : ''}</span>
        </div>

        <div className="rv-grid" style={{ opacity: loading && reviews.length > 0 ? 0.35 : 1, transition: 'opacity 0.2s' }}>
          {loading && reviews.length === 0 ? (
            <div className="rv-empty">
              <div className="rv-spinner" />
              <span>Cargando valoraciones...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="rv-empty">
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, color: '#2a4058' }}>{'>'}_</span>
              <span>
                {filter !== 'all'
                  ? 'No hay valoraciones en esta categoria.'
                  : 'Aun no hay valoraciones. Se el primero.'}
              </span>
            </div>
          ) : (
            reviews.map((r, i) => <ReviewCard key={r.id} review={r} index={i} />)
          )}
        </div>

        {totalPages > 1 && (
          <div className="rv-pag">
            <button className="rv-pag-btn" disabled={page <= 1} onClick={() => goPage(page - 1)}>
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
                  <span key={`d-${idx}`} className="rv-pag-dots">&hellip;</span>
                ) : (
                  <button
                    key={item}
                    className={`rv-pag-btn ${item === page ? 'rv-pag-active' : ''}`}
                    onClick={() => goPage(item)}
                  >
                    {item}
                  </button>
                )
              )}
            <button className="rv-pag-btn" disabled={page >= totalPages} onClick={() => goPage(page + 1)}>
              &rsaquo;
            </button>
          </div>
        )}

        <div className="rv-footer-deco">
          <span>{'<<'} DEVOPS DISASTER SIMULATOR {'>>'}</span>
        </div>
      </div>
    </div>
  );
}
