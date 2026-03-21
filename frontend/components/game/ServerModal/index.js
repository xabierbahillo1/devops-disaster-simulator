'use client';

import { useState, useEffect } from 'react';
import { STATUS_COLOR } from '../../../constants/status';
import InfoTab from './InfoTab';
import SSHPanel from './SSHPanel';
import ScalePanel from './ScalePanel';

const TABS = [
  { id: 'info',  label: 'Resumen' },
  { id: 'ssh',   label: 'Terminal SSH' },
  { id: 'scale', label: 'Escalar' },
];

export default function ServerModal({ server, onAction, onClose }) {
  const [tab, setTab] = useState('info');
  const color = STATUS_COLOR[server.status] || '#00ff88';

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="server-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="server-modal-content">
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid #1a2840' }}>
          <span className="dot" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
          <div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 13, color, letterSpacing: '0.1em' }}>
              {server.name}
            </div>
            <div style={{ fontSize: 10, color: '#5a7898' }}>
              {server.role} — {server.ip}
            </div>
          </div>
          <span style={{ marginLeft: 'auto', fontFamily: 'Orbitron, monospace', fontSize: 10, color }}>
            {server.rebooting ? 'REINICIANDO' : server.down ? 'INACTIVO' : server.status === 'green' ? 'ACTIVO' : server.status === 'yellow' ? 'ALERTA' : 'CRÍTICO'}
          </span>
          <button onClick={onClose} style={{
            color: '#5a7898', fontSize: 18, background: 'none', border: 'none', cursor: 'pointer',
            padding: '0 4px', lineHeight: 1,
          }}>✕</button>
        </div>

        <div className="flex" style={{ borderBottom: '1px solid #1a2840' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: '8px 12px', fontSize: 11, fontFamily: 'Orbitron, monospace',
              letterSpacing: '0.08em', cursor: 'pointer', border: 'none',
              background: tab === t.id ? '#142030' : 'transparent',
              color: tab === t.id ? '#00c8ff' : '#5a7898',
              borderBottom: tab === t.id ? '2px solid #00c8ff' : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col flex-1" style={{ minHeight: 0, overflow: 'auto' }}>
          {tab === 'info' && (
            <InfoTab server={server} onAction={onAction} onSwitchToScale={() => setTab('scale')} />
          )}
          {tab === 'ssh' && (
            <SSHPanel serverId={server.id} serverName={server.name} />
          )}
          {tab === 'scale' && (
            <ScalePanel server={server} onScale={(specs) => onAction('scale', server.id, specs)} />
          )}
        </div>
      </div>
    </div>
  );
}
