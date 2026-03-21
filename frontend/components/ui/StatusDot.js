export default function StatusDot({ color, size = 8 }) {
  return (
    <span
      className="dot"
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 6px ${color}`,
      }}
    />
  );
}
