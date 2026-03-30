'use client';

import { useState, useEffect } from 'react';
import HexGrid from '../components/landing/HexGrid';
import HeroSection from '../components/landing/HeroSection';
import NicknameForm from '../components/landing/NicknameForm';
import ReviewModal from '../components/ui/ReviewModal';
import { checkCanReview } from '../lib/api';

export default function LandingPage() {
  const [view, setView] = useState('hero');
  const [showReview, setShowReview] = useState(false);
  const [reviewNick, setReviewNick] = useState('');

  // Mostrar modal si el usuario llega desde una partida y aun no ha valorado
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('r');
    if (!r) return;

    let nick = '';
    try { nick = atob(decodeURIComponent(r)); } catch { return; }

    checkCanReview()
      .then(({ canReview }) => {
        if (canReview) {
          setReviewNick(nick);
          setShowReview(true);
        }
      })
      .catch(() => {});
  }, []);

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

      {showReview && <ReviewModal nickname={reviewNick} onClose={() => setShowReview(false)} />}
    </div>
  );
}
