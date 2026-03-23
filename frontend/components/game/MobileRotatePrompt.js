export default function MobileRotatePrompt() {
  return (
    <div className="grid-bg mobile-rotate-root">
      <div className="mobile-rotate-corner mobile-rotate-corner--tl" />
      <div className="mobile-rotate-corner mobile-rotate-corner--tr" />
      <div className="mobile-rotate-corner mobile-rotate-corner--bl" />
      <div className="mobile-rotate-corner mobile-rotate-corner--br" />

      <div className="mobile-rotate-scanlines" />

      <div className="mobile-rotate-content">
        <div className="mobile-rotate-icon-wrap">
          <svg
            className="mobile-rotate-icon"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="27" y="8" width="26" height="46"
              rx="4"
              stroke="#00c8ff"
              strokeWidth="2"
              fill="#00c8ff08"
            />
            <rect x="33" y="48" width="14" height="2" rx="1" fill="#00c8ff" opacity="0.5" />
            <circle cx="40" cy="14" r="2" fill="#00c8ff" opacity="0.4" />

            <path
              d="M 58 36 A 22 22 0 0 1 36 58"
              stroke="#00ff88"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="4 3"
              opacity="0.7"
            />
            <polygon
              points="33,53 36,60 42,55"
              fill="#00ff88"
              opacity="0.7"
            />
          </svg>

          <div className="mobile-rotate-glow-ring" />
        </div>

        <div className="mobile-rotate-title">
          MODO HORIZONTAL
        </div>

        <div className="mobile-rotate-subtitle">
          Gira el dispositivo para acceder<br />al panel de control
        </div>

        <div className="mobile-rotate-system-label">
          <span className="mobile-rotate-dot" />
          DEVOPS DISASTER SIMULATOR
          <span className="mobile-rotate-dot" />
        </div>
      </div>
    </div>
  );
}
