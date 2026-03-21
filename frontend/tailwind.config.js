/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
        display: ['Orbitron', 'monospace'],
      },
      colors: {
        void:   '#060b12',
        panel:  '#0b1421',
        edge:   '#142030',
        neon:   '#00ff88',
        amber:  '#ffaa00',
        crimson:'#ff3366',
        ice:    '#00c8ff',
        dim:    '#2a4060',
        muted:  '#4a6880',
        text:   '#b8ccdc',
      },
      keyframes: {
        'glow-green': {
          '0%,100%': { boxShadow: '0 0 4px #00ff8866, 0 0 8px #00ff8833' },
          '50%':     { boxShadow: '0 0 10px #00ff88aa, 0 0 20px #00ff8855' },
        },
        'glow-red': {
          '0%,100%': { boxShadow: '0 0 4px #ff336666, 0 0 8px #ff336633' },
          '50%':     { boxShadow: '0 0 12px #ff3366cc, 0 0 24px #ff336666' },
        },
        'glow-amber': {
          '0%,100%': { boxShadow: '0 0 4px #ffaa0066, 0 0 8px #ffaa0033' },
          '50%':     { boxShadow: '0 0 10px #ffaa00aa, 0 0 20px #ffaa0055' },
        },
        blink:    { '0%,49%': { opacity: 1 }, '50%,100%': { opacity: 0 } },
        'slide-in':{ '0%': { transform: 'translateY(-6px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        'fade-up': { '0%': { transform: 'translateY(8px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
      },
      animation: {
        'glow-green': 'glow-green 2.5s ease-in-out infinite',
        'glow-red':   'glow-red 1s ease-in-out infinite',
        'glow-amber': 'glow-amber 1.5s ease-in-out infinite',
        blink:        'blink 1s step-end infinite',
        'slide-in':   'slide-in 0.25s ease-out',
        'fade-up':    'fade-up 0.4s ease-out',
      },
    },
  },
  plugins: [],
};
