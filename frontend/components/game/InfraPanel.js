'use client';

import { useState, useEffect, useRef } from 'react';
import ServerCard from './ServerCard';

const SERVER_TYPES = [
  { type: 'web',      label: 'Servidor Web',   icon: '⬡' },
  { type: 'backend',  label: 'Backend',         icon: '◈' },
  { type: 'database', label: 'Base de Datos',   icon: '◉' },
];

const STORAGE_KEY = 'infra-server-order';

export default function InfraPanel({ servers, showBuyMenu, onToggleBuyMenu, onBuyServer, onOpenServer }) {
  const [order, setOrder] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
    if (!servers) return;
    setOrder(prev => {
      const existingIds = new Set(servers.map(s => s.id));
      const saved = (() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
      })();
      const base = saved.length ? saved : prev;
      const kept = base.filter(id => existingIds.has(id));
      const newIds = servers.map(s => s.id).filter(id => !kept.includes(id));
      return [...kept, ...newIds];
    });
  }, [servers]);

  useEffect(() => {
    if (order.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  }, [order]);

  const orderedServers = order
    .map(id => (servers || []).find(s => s.id === id))
    .filter(Boolean);

  const handleDragStart = (index) => {
    dragItem.current = index;
    setDragIndex(index);
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
    setOverIndex(index);
  };

  const handleDrop = () => {
    const from = dragItem.current;
    const to = dragOverItem.current;
    if (from === null || to === null || from === to) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    setOrder(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    dragItem.current = null;
    dragOverItem.current = null;
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    dragItem.current = null;
    dragOverItem.current = null;
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="flex flex-col gap-2 xl:overflow-hidden" data-zone="servers">
      <div className="flex items-center" style={{ paddingLeft: 4, paddingBottom: 2 }}>
        <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: '#6888a8', letterSpacing: '0.18em' }}>
          INFRAESTRUCTURA
        </span>
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <button className="btn-action btn-scale" style={{ fontSize: 9, padding: '2px 8px' }}
            onClick={onToggleBuyMenu}
          >
            + Comprar
          </button>
          {showBuyMenu && (
            <div className="buy-menu-dropdown" style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 50,
              background: '#0b1421', border: '1px solid #1e3048', borderRadius: 6,
              padding: 6, minWidth: 160, boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}>
              {SERVER_TYPES.map(opt => (
                <button key={opt.type} onClick={() => onBuyServer(opt.type)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '6px 10px', fontSize: 11, color: '#c8dcea',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    borderRadius: 3,
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#142030'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2 xl:flex xl:flex-col xl:overflow-auto">
        {orderedServers.map((server, index) => (
          <div
            key={server.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            className={[
              'infra-drag-item',
              dragIndex === index ? 'infra-drag-item--dragging' : '',
              overIndex === index && dragIndex !== index ? 'infra-drag-item--over' : '',
            ].join(' ')}
          >
            <ServerCard server={server} onOpen={onOpenServer} />
          </div>
        ))}
      </div>
    </div>
  );
}
