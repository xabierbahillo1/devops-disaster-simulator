'use client';

import { useState, useEffect, useCallback } from 'react';
import useZoneRect from '../../hooks/useZoneRect';
import MentorPortrait from './MentorPortrait';

export default function Mentor({ messages, onClose }) {
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(true);
  const [displayedText, setDisplayedText] = useState('');

  const current = messages[step];
  const isLast = step === messages.length - 1;
  const zoneRect = useZoneRect(current?.zone);

  // Efecto typewriter
  useEffect(() => {
    if (!current) return;
    setTyping(true);
    setDisplayedText('');
    let i = 0;
    const text = current.text;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setTyping(false);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [step, current]);

  const handleNext = useCallback(() => {
    if (typing) return;
    if (isLast) {
      onClose();
    } else {
      setStep(s => s + 1);
    }
  }, [typing, isLast, onClose]);

  if (!current) return null;

  const pad = 6;
  const hasZone = !!zoneRect;

  return (
    <div className="mentor-overlay">
      {/* Mascara oscura con recorte para la zona destacada */}
      <svg className="mentor-mask" viewBox={`0 0 ${typeof window !== 'undefined' ? window.innerWidth : 1920} ${typeof window !== 'undefined' ? window.innerHeight : 1080}`} preserveAspectRatio="none">
        <defs>
          <mask id="mentor-cutout">
            <rect width="100%" height="100%" fill="white" />
            {hasZone && (
              <rect
                x={zoneRect.left - pad}
                y={zoneRect.top - pad}
                width={zoneRect.width + pad * 2}
                height={zoneRect.height + pad * 2}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(4, 8, 16, 0.85)" mask="url(#mentor-cutout)" />
      </svg>

      {hasZone && (
        <div className="mentor-zone-border" style={{
          position: 'absolute',
          top: zoneRect.top - pad,
          left: zoneRect.left - pad,
          width: zoneRect.width + pad * 2,
          height: zoneRect.height + pad * 2,
        }} />
      )}

      <div className="mentor-dialog">
        <div className="mentor-character">
          <MentorPortrait speaking={typing} />
          <div className="mentor-name">
            <span className="mentor-name-text">Dr. Kuberneto</span>
            <span className="mentor-name-role">CTO · Fundador</span>
          </div>
        </div>

        <div className="mentor-speech">
          <div className="mentor-speech-text">
            {displayedText}
            {typing && <span className="mentor-cursor">|</span>}
          </div>

          <div className="mentor-controls">
            <span className="mentor-step-count">
              {step + 1} / {messages.length}
            </span>
            <button className="mentor-btn" onClick={handleNext} disabled={typing}
              style={typing ? { opacity: 0.3, cursor: 'not-allowed' } : {}}>
              {isLast ? 'Empezar ▸' : 'Siguiente ▸'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
