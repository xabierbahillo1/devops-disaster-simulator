'use client';

import { useEffect, useRef } from 'react';

const LEVEL_STYLE = {
  critical: { color: '#ff3366', prefix: '[CRIT]' },
  warning:  { color: '#ffaa00', prefix: '[WARN]' },
  success:  { color: '#00ff88', prefix: '[ OK ]' },
  info:     { color: '#5a7898', prefix: '[INFO]' },
};

export default function LogPanel({ logs = [] }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [logs[0]?.id]);

  return (
    <div className="panel flex flex-col flex-1 overflow-hidden min-h-0">
      <div className="panel-header">
        <span style={{ color: '#00c8ff' }}>▸</span>
        Registro de Eventos
        <span style={{ fontSize: 10, color: '#4a6880', marginLeft: 'auto' }}>
          {logs.length} entradas
        </span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5"
        style={{ minHeight: 0 }}
      >
        {logs.length === 0 && (
          <div style={{ fontSize: 11, color: '#4a6880', padding: '8px 4px' }}>
            Sin eventos aún...
          </div>
        )}
        {logs.map((entry) => {
          const style = LEVEL_STYLE[entry.level] || LEVEL_STYLE.info;
          return (
            <div key={entry.id} className="log-entry flex gap-2"
              style={{ fontSize: 11, lineHeight: '1.6', alignItems: 'flex-start' }}
            >
              <span style={{ color: '#4a6880', flexShrink: 0, userSelect: 'none', whiteSpace: 'nowrap' }}>
                {entry.gameTime || '--'}
              </span>
              <span style={{ color: style.color, flexShrink: 0, userSelect: 'none' }}>
                {style.prefix}
              </span>
              <span style={{ color: entry.level === 'info' ? '#8090b0' : '#c8dcea', wordBreak: 'break-word' }}>
                {entry.message}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
