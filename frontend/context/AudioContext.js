'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

function midiFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }
function beatSec(bpm, beats) { return (60 / bpm) * beats; }

const CALM = {
  bpm: 120,
  voices: [
    {
      wave: 'square',
      gain: 0.08,
      notes: [
        [72, 0.5], [76, 0.5], [79, 0.5], [76, 0.5],
        [74, 0.5], [77, 0.5], [81, 0.5], [77, 0.5],
        [72, 0.5], [74, 0.5], [76, 0.5], [79, 0.5],
        [77, 0.5], [76, 0.5], [74, 0.5], [72, 1.0],
        [69, 0.5], [72, 0.5], [76, 0.5], [79, 0.5],
        [67, 0.5], [71, 0.5], [74, 0.5], [77, 0.5],
        [72, 0.5], [76, 0.5], [79, 0.5], [76, 0.5],
        [77, 0.5], [74, 0.5], [72, 1.0], [72, 0.5],
      ],
    },
    {
      wave: 'triangle',
      gain: 0.035,
      notes: [
        [48, 2.0], [53, 2.0],
        [48, 2.0], [55, 2.0],
        [45, 2.0], [53, 2.0],
        [43, 2.0], [55, 2.0],
      ],
    },
  ],
};

const TENSION = {
  bpm: 155,
  voices: [
    {
      wave: 'square',
      gain: 0.09,
      notes: [
        [72, 0.25], [75, 0.25], [79, 0.25], [82, 0.25],
        [80, 0.25], [77, 0.25], [75, 0.25], [72, 0.25],
        [74, 0.25], [75, 0.25], [79, 0.25], [84, 0.25],
        [82, 0.25], [79, 0.25], [75, 0.25], [72, 0.25],
        [73, 0.25], [75, 0.25], [80, 0.25], [82, 0.25],
        [80, 0.25], [79, 0.25], [75, 0.25], [72, 0.25],
        [72, 0.5], [75, 0.25], [79, 0.25],
        [82, 0.5], [79, 0.25], [75, 0.25],
      ],
    },
    {
      wave: 'sawtooth',
      gain: 0.04,
      notes: [
        [36, 0.5], [36, 0.5], [43, 0.5], [43, 0.5],
        [41, 0.5], [41, 0.5], [39, 0.5], [39, 0.5],
      ],
    },
  ],
};

const TRACKS = { calm: CALM, tension: TENSION };
const SCHEDULE_AHEAD = 0.15;
const TICK_MS = 25;

function scheduleNote(ctx, dest, wave, freq, t, dur, peakGain) {
  try {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    const att = Math.min(0.012, dur * 0.06);
    const rel = Math.min(0.04, dur * 0.25);
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(peakGain, t + att);
    env.gain.setValueAtTime(peakGain, t + dur - rel);
    env.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(env);
    env.connect(dest);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  } catch (_) {}
}

function buildSFX(ctx, dest) {
  function tone(wave, freq, t, dur, gain) {
    try {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = wave;
      osc.frequency.value = freq;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(gain, t + 0.005);
      env.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(env);
      env.connect(dest);
      osc.start(t);
      osc.stop(t + dur + 0.01);
    } catch (_) {}
  }

  return {
    click: () => tone('square', 900, ctx.currentTime, 0.035, 0.22),
    correct: () => {
      const t = ctx.currentTime;
      [[523, 0], [659, 0.07], [784, 0.14]].forEach(([f, d]) =>
        tone('square', f, t + d, 0.13, 0.18));
    },
    error: () => {
      const t = ctx.currentTime;
      [[220, 0], [196, 0.09], [175, 0.18]].forEach(([f, d]) =>
        tone('sawtooth', f, t + d, 0.12, 0.22));
    },
    alert: () => {
      const t = ctx.currentTime;
      [0, 0.19, 0.38].forEach(d => {
        tone('square', 880, t + d, 0.08, 0.28);
        tone('square', 660, t + d + 0.095, 0.08, 0.28);
      });
    },
    'chat-open': () => {
      const t = ctx.currentTime;
      tone('triangle', 1047, t, 0.09, 0.14);
      tone('triangle', 1319, t + 0.08, 0.09, 0.14);
    },
    'chat-send': () => {
      const t = ctx.currentTime;
      tone('sine', 660, t, 0.06, 0.13);
      tone('sine', 880, t + 0.05, 0.05, 0.1);
    },
    'chat-receive': () => {
      const t = ctx.currentTime;
      tone('triangle', 880, t, 0.08, 0.12);
      tone('triangle', 1047, t + 0.07, 0.1, 0.14);
    },
  };
}

// el AudioContext tiene que ser a nivel de modulo para sobrevivir re-mounts de componentes
let _ctx = null;
let _masterGain = null;

function getOrCreateCtx() {
  if (_ctx && _ctx.state !== 'closed') return _ctx;
  if (typeof window === 'undefined') return null;
  _ctx = new (window.AudioContext || window.webkitAudioContext)();
  _masterGain = _ctx.createGain();
  _masterGain.connect(_ctx.destination);
  return _ctx;
}

// se llama desde el submit del formulario de nickname, antes de cualquier await,
// mientras el gesto de usuario sigue activo en el navegador
export function prewarmAudio() {
  getOrCreateCtx();
}

const AudioCtx = createContext({
  isMuted: false,
  toggleAudio: () => {},
  setMusicState: () => {},
  playSFX: () => {},
  playMentorVoice: () => {},
});

export function AudioProvider({ children }) {
  const [isMuted, setIsMuted] = useState(false);
  const eng = useRef(null);

  const getEng = useCallback(() => {
    if (eng.current) return eng.current;
    const ctx = getOrCreateCtx();
    if (!ctx) return null;

    const trackGains = {};
    ['calm', 'tension'].forEach(name => {
      const g = ctx.createGain();
      g.gain.value = 0;
      g.connect(_masterGain);
      trackGains[name] = g;
    });

    eng.current = {
      ctx,
      trackGains,
      sfx: buildSFX(ctx, _masterGain),
      voiceStates: {
        calm:    [{ idx: 0, nextTime: 0 }, { idx: 0, nextTime: 0 }],
        tension: [{ idx: 0, nextTime: 0 }, { idx: 0, nextTime: 0 }],
      },
      activeTrack: null,
      timerId: null,
    };
    return eng.current;
  }, []);

  useEffect(() => {
    const ctx = getOrCreateCtx();
    if (ctx?.state === 'suspended') ctx.resume().catch(() => {});

    // algunos navegadores bloquean el audio hasta la primera interaccion
    const resume = () => {
      if (_ctx?.state === 'suspended') _ctx.resume().catch(() => {});
    };
    document.addEventListener('click', resume);
    document.addEventListener('keydown', resume);
    return () => {
      document.removeEventListener('click', resume);
      document.removeEventListener('keydown', resume);
      if (eng.current?.timerId) {
        clearInterval(eng.current.timerId);
        eng.current.timerId = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!_masterGain || !_ctx) return;
    const now = _ctx.currentTime;
    _masterGain.gain.cancelScheduledValues(now);
    _masterGain.gain.setValueAtTime(_masterGain.gain.value, now);
    _masterGain.gain.linearRampToValueAtTime(isMuted ? 0 : 1, now + 0.15);
  }, [isMuted]);

  const toggleAudio = useCallback(() => setIsMuted(v => !v), []);

  const runTick = useCallback(() => {
    const e = eng.current;
    if (!e?.ctx || !e.activeTrack) return;
    if (e.ctx.state !== 'running') return;

    const track = TRACKS[e.activeTrack];
    const now = e.ctx.currentTime;
    const horizon = now + SCHEDULE_AHEAD;
    const dest = e.trackGains[e.activeTrack];
    const voiceStates = e.voiceStates[e.activeTrack];

    track.voices.forEach((voice, i) => {
      const vs = voiceStates[i];
      if (vs.nextTime < now) vs.nextTime = now;
      while (vs.nextTime < horizon) {
        const [midi, beats] = voice.notes[vs.idx % voice.notes.length];
        const dur = beatSec(track.bpm, beats);
        scheduleNote(e.ctx, dest, voice.wave, midiFreq(midi), vs.nextTime, dur, voice.gain);
        vs.nextTime += dur;
        vs.idx = (vs.idx + 1) % voice.notes.length;
      }
    });
  }, []);

  const setMusicState = useCallback((state) => {
    const e = getEng();
    if (!e) return;

    const targetTrack =
      state === 'incident' ? 'tension' :
      state === 'normal'   ? 'calm'    : null;

    // si ya esta sonando la pista correcta y el scheduler esta vivo, no hacemos nada
    if (targetTrack === e.activeTrack && e.timerId) return;

    if (e.ctx.state === 'suspended') e.ctx.resume().catch(() => {});

    const now = e.ctx.currentTime;
    const FADE = 0.75;

    if (e.activeTrack && e.trackGains[e.activeTrack]) {
      const g = e.trackGains[e.activeTrack];
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.linearRampToValueAtTime(0, now + FADE);
    }

    if (targetTrack) {
      const vs = e.voiceStates[targetTrack];
      vs.forEach(v => { v.idx = 0; v.nextTime = now + FADE * 0.3; });

      const g = e.trackGains[targetTrack];
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.6, now + FADE);

      e.activeTrack = targetTrack;

      if (!e.timerId) {
        e.timerId = setInterval(runTick, TICK_MS);
      }
    } else {
      e.activeTrack = null;
      if (e.timerId) {
        clearInterval(e.timerId);
        e.timerId = null;
      }
    }
  }, [runTick, getEng]);

  const playSFX = useCallback((name) => {
    const e = getEng();
    if (!e) return;
    if (e.ctx.state === 'suspended') e.ctx.resume().catch(() => {});
    e.sfx?.[name]?.();
  }, [getEng]);

  const playMentorVoice = useCallback((char) => {
    if (' \n.,!?¡¿:;-–—"\'()'.includes(char)) return;
    const ctx = _ctx;
    if (!ctx || ctx.state !== 'running') return;

    try {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'triangle';

      // pitch ligeramente distinto por caracter para simular voz
      const code = char.charCodeAt(0);
      const base = 380 + (code % 10) * 38;
      osc.frequency.value = base * (0.93 + Math.random() * 0.14);

      const t = ctx.currentTime;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.11, t + 0.006);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.072);

      osc.connect(env);
      env.connect(_masterGain);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch (_) {}
  }, []);

  return (
    <AudioCtx.Provider value={{ isMuted, toggleAudio, setMusicState, playSFX, playMentorVoice }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudioSettings() {
  return useContext(AudioCtx);
}
