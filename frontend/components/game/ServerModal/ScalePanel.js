'use client';

import { useState } from 'react';
import { CPU_OPTIONS, RAM_OPTIONS, DISK_OPTIONS, COST_VCPU, COST_RAM, COST_DISK } from '../../../constants/server';

function fmtDisk(gb) {
  return gb >= 1000 ? `${gb / 1000} TB` : `${gb}`;
}

export default function ScalePanel({ server, onScale }) {
  const [cores, setCores] = useState(server.specs.cpuCores);
  const [ram, setRam]     = useState(server.specs.ramGB);
  const [disk, setDisk]   = useState(server.specs.diskGB);

  const oldCost = server.costPerHour * 24;
  const newCost = (cores * COST_VCPU + ram * COST_RAM + disk * COST_DISK) * 24;
  const delta   = newCost - oldCost;
  const needsReboot = cores !== server.specs.cpuCores || ram !== server.specs.ramGB;

  return (
    <div style={{ padding: '12px 16px', borderTop: '1px solid #1a2840' }}>
      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: '#7090b0', letterSpacing: '0.15em', marginBottom: 8 }}>
        ESCALAR RECURSOS
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span style={{ width: 36, fontSize: 11, color: '#7090b0' }}>CPU</span>
        <div className="flex gap-1 flex-wrap">
          {CPU_OPTIONS.map(v => (
            <button key={v} onClick={() => setCores(v)}
              className={`btn-resource ${v === cores ? 'active' : ''}`}
            >{v}</button>
          ))}
        </div>
        <span style={{ fontSize: 10, color: '#7090b0', marginLeft: 'auto' }}>vCPU</span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span style={{ width: 36, fontSize: 11, color: '#7090b0' }}>RAM</span>
        <div className="flex gap-1 flex-wrap">
          {RAM_OPTIONS.map(v => (
            <button key={v} onClick={() => setRam(v)}
              className={`btn-resource ${v === ram ? 'active' : ''}`}
            >{v}</button>
          ))}
        </div>
        <span style={{ fontSize: 10, color: '#7090b0', marginLeft: 'auto' }}>GB</span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span style={{ width: 36, fontSize: 11, color: '#7090b0' }}>DSK</span>
        <div className="flex gap-1 flex-wrap">
          {DISK_OPTIONS.map(v => (
            <button key={v} onClick={() => setDisk(v)}
              className={`btn-resource ${v === disk ? 'active' : ''}`}
              disabled={v < Math.ceil(server.usage.diskUsedGB) + 1}
              style={v < Math.ceil(server.usage.diskUsedGB) + 1 ? { opacity: 0.3 } : {}}
            >{fmtDisk(v)}</button>
          ))}
        </div>
        <span style={{ fontSize: 10, color: '#7090b0', marginLeft: 'auto' }}>{disk >= 1000 ? 'TB' : 'GB'}</span>
      </div>

      <div style={{ fontSize: 11, color: '#8090b0', marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span>Coste: ${oldCost.toFixed(2)}/d → <span style={{ color: delta > 0 ? '#ffaa00' : delta < 0 ? '#00ff88' : '#c8dcea', fontWeight: 600 }}>${newCost.toFixed(2)}/d</span></span>
        <span style={{ color: delta > 0 ? '#ff8800' : '#00ff88' }}>({delta >= 0 ? '+' : ''}{delta.toFixed(2)}/d)</span>
        {needsReboot && <span style={{ color: '#ffaa00', fontSize: 10 }}>⚠ Requiere reinicio</span>}
      </div>

      <button className="btn-action btn-scale" style={{ width: '100%' }}
        onClick={() => onScale({ cpuCores: cores, ramGB: ram, diskGB: disk })}
      >
        Aplicar Cambios
      </button>
    </div>
  );
}
