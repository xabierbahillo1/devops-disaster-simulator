'use client';

import { useState } from 'react';
import StatusDot from '../ui/StatusDot';

export default function ClientsPanel({ clients, consecutiveDownHours }) {
  const [collapsed, setCollapsed] = useState(false);

  if (!clients || clients.length === 0) return null;

  return (
    <div className="panel flex flex-col" style={{ flexShrink: 0 }}>
      <div
        className="panel-header panel-header-animated panel-header--clickable"
        onClick={() => setCollapsed(c => !c)}
      >
        <span style={{ color: '#ffaa00' }}>★</span>
        Clientes
        {(consecutiveDownHours || 0) > 0 && (
          <span style={{
            marginLeft: 'auto', fontFamily: 'Orbitron, monospace', fontSize: 9,
            background: '#ff336622', color: '#ff3366', padding: '1px 6px',
            borderRadius: 2, border: '1px solid #ff336644',
          }}>
            CAÍDA: {consecutiveDownHours}h
          </span>
        )}
        <span className={`panel-chevron${collapsed ? ' panel-chevron--collapsed' : ''}`} style={{ marginLeft: (consecutiveDownHours || 0) > 0 ? '6px' : 'auto' }}>›</span>
      </div>
      <div className={`panel-collapsible${collapsed ? ' panel-collapsible--collapsed' : ''}`}>
        <div className="panel-collapsible-inner">
          <div className="flex flex-col p-1.5 gap-1 overflow-y-auto" style={{ maxHeight: 180 }}>
            {[...clients].sort((a, b) => b.revenuePerHour - a.revenuePerHour).map(c => {
              const statusColor = c.churned ? '#ff3366' : c.threatened ? '#ff3366' : c.claimed ? '#ffaa00' : c.warning ? '#ffaa00' : '#00ff88';
              const statusText  = c.churned ? 'PERDIDO' : c.threatened ? 'AMENAZA' : c.claimed ? 'RECLAMO' : c.warning ? 'QUEJA' : 'OK';
              return (
                <div key={c.name} className="panel flex items-center gap-2 px-3 py-1.5"
                  style={{
                    borderColor: c.churned ? '#ff336633' : c.threatened ? '#ff336622' : '#142030',
                    opacity: c.churned ? 0.5 : 1,
                  }}
                >
                  <StatusDot color={statusColor} />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span style={{ fontSize: 11, color: c.churned ? '#5a7898' : '#c8dcea', textDecoration: c.churned ? 'line-through' : 'none' }}>
                      {c.name}
                    </span>
                    <span style={{ fontSize: 9, color: '#5a7898' }}>
                      SLA: {c.sla}% — ${c.revenuePerHour}/h
                    </span>
                  </div>
                  <span style={{ fontSize: 9, color: statusColor, fontWeight: 500 }}>
                    {statusText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
