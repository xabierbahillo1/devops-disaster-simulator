import { useState, useEffect } from 'react';

const ZONE_SELECTORS = {
  header:  '.game-header',
  hud:     '.game-hud-bar',
  servers: '[data-zone="servers"]',
  metrics: '[data-zone="metrics"]',
  right:   '[data-zone="right"]',
};

export default function useZoneRect(zone) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (!zone) { setRect(null); return; }
    const selector = ZONE_SELECTORS[zone];
    if (!selector) { setRect(null); return; }

    const measure = () => {
      const el = document.querySelector(selector);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      } else {
        setRect(null);
      }
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [zone]);

  return rect;
}
