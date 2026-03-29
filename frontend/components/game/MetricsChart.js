'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { STATUS_COLOR } from '../../constants/status';

const STORAGE_KEY = 'metrics-server-order';

function AreaSparkline({ data, color, width = 140, height = 40, id }) {
  const path = useMemo(() => {
    if (!data || data.length < 2) return { line: '', area: '' };
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (Math.min(v, 100) / 100) * height;
      return [x, y];
    });
    const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const area = line + ` L${width},${height} L0,${height} Z`;
    return { line, area };
  }, [data, width, height]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={path.area} fill={`url(#g-${id})`} />
      <path d={path.line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      {data && data.length > 0 && (() => {
        const last = data[data.length - 1];
        const x = width;
        const y = height - (Math.min(last, 100) / 100) * height;
        return <circle cx={x} cy={y} r="2.5" fill={color} />;
      })()}
    </svg>
  );
}

function ServerMiniChart({ server, history }) {
  const cpuData = history?.cpu || [];
  const ramData = history?.ram || [];
  const color   = STATUS_COLOR[server.status] || '#00ff88';

  return (
    <div className="panel flex flex-col gap-0 overflow-hidden">
      <div className="panel-header" style={{ padding: '5px 10px 4px' }}>
        <span className="dot" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
        <span style={{ fontSize: 10 }}>{server.name}</span>
        <span className="ml-auto" style={{ color, fontSize: 9 }}>
          {server.rebooting ? '⟳' : server.down ? '✖' : server.status === 'green' ? '●' : '▲'}
        </span>
      </div>
      <div className="flex gap-2 p-2">
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex justify-between" style={{ fontSize: 10, color: '#7090b0' }}>
            <span>CPU</span>
            <span style={{ color: server.down ? '#ff3366' : color }}>
              {server.down ? '--' : `${Math.round(server.usage.cpuPercent)}%`}
            </span>
          </div>
          <AreaSparkline
            data={cpuData.length ? cpuData : [server.usage?.cpuPercent || 0]}
            color={server.down ? '#ff3366' : color}
            id={`${server.id}-cpu`}
          />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex justify-between" style={{ fontSize: 10, color: '#7090b0' }}>
            <span>RAM</span>
            <span style={{ color: server.down ? '#ff3366' : '#00c8ff' }}>
              {server.down ? '--' : `${server.usage.ramUsedGB.toFixed(1)}/${server.specs.ramGB}G`}
            </span>
          </div>
          <AreaSparkline
            data={ramData.length ? ramData : [0]}
            color={server.down ? '#ff3366' : '#00c8ff'}
            id={`${server.id}-ram`}
          />
        </div>
      </div>
    </div>
  );
}

export default function MetricsChart({ servers, history = {} }) {
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
    <div className="panel flex flex-col">
      <div className="panel-header">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="4" fill="none" stroke="#00c8ff" strokeWidth="1" />
          <circle cx="5" cy="5" r="2" fill="#00c8ff" />
        </svg>
        Métricas en Tiempo Real
        <span className="ml-auto text-neon animate-blink" style={{ fontSize: 10 }}>● EN VIVO</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
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
            <ServerMiniChart server={server} history={history[server.id]} />
          </div>
        ))}
      </div>
    </div>
  );
}
