export default function ActionToast({ feedback }) {
  if (!feedback) return null;
  const color = feedback.success ? '#00ff88' : '#ff3366';
  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      background: '#0d1a28', border: `1px solid ${color}44`, color,
      fontFamily: 'JetBrains Mono, monospace', fontSize: 12, padding: '8px 20px',
      borderRadius: 4, boxShadow: `0 0 16px ${color}22`, zIndex: 100,
      animation: 'fade-up 0.25s ease-out', whiteSpace: 'nowrap',
    }}>
      {feedback.success ? '✓' : '✗'} {feedback.message}
    </div>
  );
}
