'use client';

import { useState, useEffect } from 'react';

export default function TerminalLine({ text, delay }) {
  const [visible, setVisible] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setVisible(text.slice(0, i));
        if (i >= text.length) { clearInterval(interval); setDone(true); }
      }, 22);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <span>
      {visible}
      {!done && <span className="landing-cursor">_</span>}
    </span>
  );
}
