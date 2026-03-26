import ServiceCard from './ServiceCard';

export default function ServicesPanel({ services }) {
  return (
    <div className="panel flex flex-col" style={{ flexShrink: 0 }}>
      <div className="panel-header panel-header-animated">
        <span style={{ color: '#00c8ff' }}>◈</span>
        Servicios
      </div>
      <div className="flex flex-col p-1.5 gap-1">
        {(services || []).map(svc => (
          <ServiceCard key={svc.id} service={svc} />
        ))}
      </div>
    </div>
  );
}
