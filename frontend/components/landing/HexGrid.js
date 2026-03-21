function hexPoints(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');
}

const HEX_POSITIONS = [
  [100, 80], [220, 140], [340, 60], [460, 120], [580, 80], [700, 140],
  [160, 240], [280, 300], [400, 220], [520, 280], [640, 240],
  [100, 400], [220, 460], [340, 380], [460, 440], [580, 400], [700, 460],
  [160, 540], [400, 520], [640, 540],
];

export default function HexGrid() {
  return (
    <svg className="landing-hex-grid" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
      {HEX_POSITIONS.map(([cx, cy], i) => (
        <g key={i} style={{ animation: `hex-float ${3 + (i % 4)}s ease-in-out ${(i * 0.3) % 2}s infinite alternate` }}>
          <polygon
            points={hexPoints(cx, cy, 18)}
            fill="none"
            stroke="#00c8ff"
            strokeWidth="0.5"
            opacity={0.07 + (i % 3) * 0.03}
          />
        </g>
      ))}
    </svg>
  );
}
