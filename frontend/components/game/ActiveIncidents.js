'use client';

import { useState, useEffect, useRef } from 'react';
import { EVENT_ICON, EVENT_BORDER } from '../../constants/events';

export default function ActiveIncidents({ events, onOpenServer }) {
  const [collapsed, setCollapsed] = useState(false);
  const [order, setOrder] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const didDrag = useRef(false);

  useEffect(() => {
    if (!events) return;
    setOrder(prev => {
      const existingIds = new Set(events.map(e => e.id));
      const kept = prev.filter(id => existingIds.has(id));
      const newIds = events.map(e => e.id).filter(id => !kept.includes(id));
      return [...kept, ...newIds];
    });
  }, [events]);

  if (!events || events.length === 0) {
    return (
      <div className="panel flex items-center justify-center gap-2" style={{ padding: '14px', minHeight: 56 }}>
        <span className="dot dot-green" />
        <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, color: '#00ff8899', letterSpacing: '0.12em' }}>
          TODOS LOS SISTEMAS OPERATIVOS
        </span>
      </div>
    );
  }

  const orderedEvents = order
    .map(id => events.find(e => e.id === id))
    .filter(Boolean);

  const handleDragStart = (index) => {
    dragItem.current = index;
    didDrag.current = false;
    setDragIndex(index);
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
    setOverIndex(index);
  };

  const handleDrop = () => {
    const from = dragItem.current;
    const to = dragOverItem.current;
    if (from !== null && to !== null && from !== to) {
      didDrag.current = true;
      setOrder(prev => {
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      });
    }
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
    <div className="panel flex flex-col">
      <div
        className="panel-header panel-header-animated panel-header--clickable"
        onClick={() => setCollapsed(c => !c)}
      >
        <span style={{ color: '#ff3366' }}>⚠</span>
        Incidentes Activos
        <span style={{
          marginLeft: 'auto', fontFamily: 'Orbitron, monospace', fontSize: 9,
          background: '#ff336622', color: '#ff3366', padding: '1px 6px',
          borderRadius: 2, border: '1px solid #ff336644',
        }}>
          {events.length}
        </span>
        <span className={`panel-chevron${collapsed ? ' panel-chevron--collapsed' : ''}`}>›</span>
      </div>
      <div className={`panel-collapsible${collapsed ? ' panel-collapsible--collapsed' : ''}`}>
        <div className="panel-collapsible-inner">
          <div className="flex flex-col gap-1.5 p-2">
            {orderedEvents.map((ev, index) => (
              <div
                key={ev.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                onClick={() => { if (!didDrag.current) onOpenServer(ev.target); didDrag.current = false; }}
                className={[
                  'incident-card incident-card-enter cursor-pointer',
                  ev.severity === 'critical' ? 'incident-critical' : '',
                  'infra-drag-item',
                  dragIndex === index ? 'infra-drag-item--dragging' : '',
                  overIndex === index && dragIndex !== index ? 'infra-drag-item--over' : '',
                ].join(' ')}
                style={{ borderLeftColor: EVENT_BORDER[ev.type] || '#ffaa00' }}
              >
                <div className="flex items-start gap-2">
                  <span style={{ fontSize: 14 }}>{EVENT_ICON[ev.type] || '⚠'}</span>
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{
                        fontFamily: 'Orbitron, monospace', fontSize: 10,
                        color: EVENT_BORDER[ev.type] || '#ffaa00', letterSpacing: '0.08em',
                      }}>
                        ALERTA
                      </span>
                      <span style={{ fontSize: 11, color: '#7090b0' }}>→ {ev.targetName}</span>
                    </div>
                    <p style={{ fontSize: 11, color: '#8090b0', margin: 0, lineHeight: 1.4 }}>
                      {ev.msg}
                    </p>
                  </div>
                  <span style={{
                    fontSize: 9, color: '#5a7898', fontFamily: 'Orbitron, monospace',
                    letterSpacing: '0.06em', flexShrink: 0,
                  }}>
                    INVESTIGAR ▸
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
