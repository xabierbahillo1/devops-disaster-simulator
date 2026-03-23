'use client';
import { useEffect, useState } from 'react';

const GAME_WIDTH = 1280;

export default function useMobileScale() {
  const [state, setState] = useState({
    ready: false,
    isMobile: false,
    isPortrait: false,
    scale: 1,
    scaledHeight: 0,
  });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const portrait = h > w;
      const mobile = w < GAME_WIDTH;

      if (mobile && !portrait) {
        const s = w / GAME_WIDTH;
        setState({ ready: true, isMobile: true, isPortrait: false, scale: s, scaledHeight: h / s });
      } else {
        setState({ ready: true, isMobile: mobile, isPortrait: mobile && portrait, scale: 1, scaledHeight: 0 });
      }
    };

    update();
    const onOrient = () => setTimeout(update, 150);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', onOrient);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', onOrient);
    };
  }, []);

  return state;
}
