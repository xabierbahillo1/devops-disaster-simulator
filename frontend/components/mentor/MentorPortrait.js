export default function MentorPortrait({ speaking }) {
  return (
    <svg viewBox="0 0 120 120" className="mentor-portrait">
      {/* Cuerpo */}
      <path d="M30,120 L30,105 Q30,88 47,82 L73,82 Q90,88 90,105 L90,120" fill="#1a4a6a" />
      <path d="M52,82 L52,90 L60,94 L68,90 L68,82" fill="#1a4a6a" />
      {/* Cuello de la camisa */}
      <path d="M52,83 L57,92 L60,89" fill="none" stroke="#0d3048" strokeWidth="1.5" />
      <path d="M68,83 L63,92 L60,89" fill="none" stroke="#0d3048" strokeWidth="1.5" />
      {/* Tarjeta identificativa */}
      <rect x="35" y="96" width="16" height="18" rx="2" fill="#e8e8e0" stroke="#b0b0a8" strokeWidth="0.8" />
      <rect x="38" y="99" width="10" height="3" rx="1" fill="#00c8ff" opacity="0.6" />
      <rect x="38" y="104" width="10" height="1" fill="#b0b0a8" />
      <rect x="38" y="107" width="7" height="1" fill="#b0b0a8" />
      {/* Cuello */}
      <rect x="53" y="72" width="14" height="14" rx="3" fill="#d4a574" />
      {/* Cabeza */}
      <ellipse cx="60" cy="52" rx="26" ry="28" fill="#d4a574" />
      {/* Pelo */}
      <path d="M34,48 Q34,22 60,20 Q86,22 86,48 L84,42 Q82,28 60,25 Q38,28 36,42 Z" fill="#8899a8" />
      <path d="M34,48 Q33,40 36,36" fill="none" stroke="#6a7a88" strokeWidth="2" />
      <path d="M86,48 Q87,40 84,36" fill="none" stroke="#6a7a88" strokeWidth="2" />
      {/* Patillas */}
      <path d="M36,48 L34,56 L37,54" fill="#8899a8" />
      <path d="M84,48 L86,56 L83,54" fill="#8899a8" />
      {/* Cejas */}
      <path d="M43,42 Q48,38 55,41" fill="none" stroke="#5a6a78" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M65,41 Q72,38 77,42" fill="none" stroke="#5a6a78" strokeWidth="2.5" strokeLinecap="round" />
      {/* Gafas */}
      <rect x="42" y="44" width="14" height="11" rx="3" fill="none" stroke="#2a3a4a" strokeWidth="1.8" />
      <rect x="64" y="44" width="14" height="11" rx="3" fill="none" stroke="#2a3a4a" strokeWidth="1.8" />
      <line x1="56" y1="49" x2="64" y2="49" stroke="#2a3a4a" strokeWidth="1.2" />
      <line x1="42" y1="49" x2="37" y2="47" stroke="#2a3a4a" strokeWidth="1.2" />
      <line x1="78" y1="49" x2="83" y2="47" stroke="#2a3a4a" strokeWidth="1.2" />
      {/* Reflejo de los cristales */}
      <line x1="44" y1="46" x2="47" y2="46" stroke="white" strokeWidth="0.6" opacity="0.3" />
      <line x1="66" y1="46" x2="69" y2="46" stroke="white" strokeWidth="0.6" opacity="0.3" />
      {/* Ojos */}
      <circle cx="49" cy="50" r="2.5" fill="#1a2a3a" />
      <circle cx="71" cy="50" r="2.5" fill="#1a2a3a" />
      <circle cx="50" cy="49" r="0.8" fill="white" />
      <circle cx="72" cy="49" r="0.8" fill="white" />
      {/* Nariz */}
      <path d="M58,52 Q60,58 62,52" fill="none" stroke="#b8906a" strokeWidth="1.2" strokeLinecap="round" />
      {/* Boca */}
      {speaking ? (
        <ellipse cx="60" cy="65" rx="5" ry="3.5" fill="#a0442a" stroke="#8a3420" strokeWidth="0.8" />
      ) : (
        <path d="M52,64 Q60,70 68,64" fill="none" stroke="#a0644a" strokeWidth="1.8" strokeLinecap="round" />
      )}
      {/* Arrugas de expresion */}
      <path d="M40,60 Q38,58 40,56" fill="none" stroke="#c09060" strokeWidth="0.6" opacity="0.5" />
      <path d="M80,60 Q82,58 80,56" fill="none" stroke="#c09060" strokeWidth="0.6" opacity="0.5" />
      {/* Taza de cafe */}
      <g transform="translate(78,98)">
        <rect x="0" y="4" width="10" height="12" rx="2" fill="#2a3a4a" />
        <path d="M10,7 Q15,7 15,10 Q15,13 10,13" fill="none" stroke="#2a3a4a" strokeWidth="1.5" />
        <path d="M3,2 Q4,-1 3,-3" fill="none" stroke="#8090a0" strokeWidth="0.8" opacity="0.6">
          <animate attributeName="d" values="M3,2 Q4,-1 3,-3;M3,2 Q2,-1 3,-3;M3,2 Q4,-1 3,-3" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M6,1 Q7,-2 6,-4" fill="none" stroke="#8090a0" strokeWidth="0.8" opacity="0.4">
          <animate attributeName="d" values="M6,1 Q7,-2 6,-4;M6,1 Q5,-2 6,-4;M6,1 Q7,-2 6,-4" dur="2.5s" repeatCount="indefinite" />
        </path>
      </g>
    </svg>
  );
}
