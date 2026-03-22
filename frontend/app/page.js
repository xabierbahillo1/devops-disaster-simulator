'use client';

import { useState } from 'react';
import HexGrid from '../components/landing/HexGrid';
import HeroSection from '../components/landing/HeroSection';
import NicknameForm from '../components/landing/NicknameForm';

export default function LandingPage() {
  const [view, setView] = useState('hero');

  return (
    <div className="landing-root">
      <HexGrid />

      {view === 'hero' && (
        <HeroSection
          onPlay={() => setView('nickname')}
        />
      )}

      {view === 'nickname' && (
        <NicknameForm onBack={() => setView('hero')} />
      )}

      <footer className="landing-footer">
        <span>DevOps Disaster Simulator</span>
        <span className="landing-footer-sep">—</span>
        <span>Simulador de gestión de infraestructura</span>
      </footer>
    </div>
  );
}
