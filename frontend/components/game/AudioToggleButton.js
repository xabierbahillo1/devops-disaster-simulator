'use client';

import { useAudioSettings } from '../../context/AudioContext';

export default function AudioToggleButton() {
  const { isMuted, toggleAudio } = useAudioSettings();

  return (
    <button
      className={`audio-btn${isMuted ? ' muted' : ''}`}
      onClick={toggleAudio}
      title={isMuted ? 'Activar audio' : 'Silenciar audio'}
      aria-label={isMuted ? 'Activar audio' : 'Silenciar audio'}
    >
      <svg
        width="11"
        height="13"
        viewBox="0 0 11 13"
        fill="none"
        style={{ flexShrink: 0, opacity: isMuted ? 0.35 : 0.9 }}
      >
        <path
          d="M1 4.5H0.5a.5.5 0 00-.5.5v3a.5.5 0 00.5.5H1l3.5 2.5V2L1 4.5z"
          fill={isMuted ? '#3a5068' : '#00ff88'}
        />
        {!isMuted && (
          <>
            <path
              d="M7 4.5a2.5 2.5 0 010 4"
              stroke="#00ff88"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M8.5 3a4.5 4.5 0 010 7"
              stroke="#00ff8866"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}
      </svg>

      <div className="audio-bars">
        <div className="audio-bar bar-1" />
        <div className="audio-bar bar-2" />
        <div className="audio-bar bar-3" />
        <div className="audio-bar bar-4" />
        <div className="audio-bar bar-5" />
      </div>

      {isMuted && <div className="audio-slash" />}
    </button>
  );
}
