'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createSession } from '../../lib/api';
import { prewarmAudio } from '../../context/AudioContext';

export default function NicknameForm({ onBack }) {
  const router = useRouter();
  const [nick, setNick] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const trimmed = nick.trim();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!trimmed || loading) return;
    prewarmAudio();
    setLoading(true);

    try {
      const result = await createSession(trimmed);
      if (result.success && result.sessionKey) {
        localStorage.setItem('playerNick', trimmed);
        sessionStorage.setItem('sessionKey', result.sessionKey);
        sessionStorage.removeItem('introSeen');
        router.push('/game');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="landing-hero">
      <form onSubmit={handleStart} className="landing-nick-form">
        <label className="landing-nick-label">NICKNAME</label>
        <div className="landing-nick-row">
          <input
            ref={inputRef}
            className="landing-nick-input"
            maxLength={20}
            value={nick}
            onChange={e => setNick(e.target.value)}
            placeholder="tu_nombre"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!trimmed || loading}
            className={`landing-btn-go ${trimmed && !loading ? 'active' : ''}`}
          >
            {loading ? '...' : '▸'}
          </button>
        </div>
        <div className="landing-nick-hint">Max. 20 caracteres. Se usara en el ranking.</div>
        <button type="button" className="landing-back" onClick={onBack}>
          ← Volver
        </button>
      </form>
    </section>
  );
}
