export default function PhoneButton({ onClick, hasUnread }) {
  return (
    <button
      className="phone-btn"
      data-zone="phone-btn"
      title={hasUnread ? 'Yamlito te ha escrito' : 'Chat con Yamlito'}
      onClick={onClick}
    >
      <svg
        className="phone-btn-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#00ff88"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
      {hasUnread && <span className="phone-btn-badge" />}
    </button>
  );
}
