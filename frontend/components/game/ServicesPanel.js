'use client';

import { useState } from 'react';
import ServiceCard from './ServiceCard';

export default function ServicesPanel({ services }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="panel flex flex-col" style={{ flexShrink: 0 }}>
      <div
        className="panel-header panel-header-animated panel-header--clickable"
        onClick={() => setCollapsed(c => !c)}
      >
        <span style={{ color: '#00c8ff' }}>◈</span>
        Servicios
        <span className={`panel-chevron${collapsed ? ' panel-chevron--collapsed' : ''}`} style={{ marginLeft: 'auto' }}>›</span>
      </div>
      <div className={`panel-collapsible${collapsed ? ' panel-collapsible--collapsed' : ''}`}>
        <div className="panel-collapsible-inner">
          <div className="flex flex-col p-1.5 gap-1">
            {(services || []).map(svc => (
              <ServiceCard key={svc.id} service={svc} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
