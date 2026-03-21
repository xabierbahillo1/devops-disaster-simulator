'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchSSH } from '../../../lib/api';

export default function SSHPanel({ serverId, serverName }) {
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const termRef = useRef(null);

  const loadSSH = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSSH(serverId);
      setOutput(data);
    } catch { setOutput({ connected: false, output: 'Error de conexión' }); }
    setLoading(false);
  }, [serverId]);

  useEffect(() => { loadSSH(); }, [loadSSH]);

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = 0;
  }, [output]);

  return (
    <div className="flex flex-col" style={{ minHeight: 0, flex: 1 }}>
      <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid #1a2840' }}>
        <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: '#00c8ff', letterSpacing: '0.12em' }}>
          SSH
        </span>
        <span style={{ fontSize: 11, color: '#7090b0' }}>admin@{serverName.toLowerCase()}</span>
        <button onClick={loadSSH} disabled={loading}
          style={{
            marginLeft: 'auto', fontSize: 10, color: '#00c8ff', background: '#00c8ff0a',
            border: '1px solid #00c8ff44', borderRadius: 3, padding: '2px 10px', cursor: 'pointer',
          }}
        >
          {loading ? '...' : '↻ Actualizar'}
        </button>
      </div>
      <div ref={termRef} className="flex-1 overflow-auto" style={{
        padding: '10px 14px', minHeight: 0, maxHeight: 400,
        background: '#030810', fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
        lineHeight: 1.6, color: '#a0b8c8', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
      }}>
        {loading && !output && <span style={{ color: '#4a6880' }}>Conectando...</span>}
        {output && !output.connected && (
          <span style={{ color: '#ff3366' }}>{output.output}</span>
        )}
        {output && output.connected && output.output}
      </div>
    </div>
  );
}
