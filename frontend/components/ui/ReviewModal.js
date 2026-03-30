'use client';

import { useState } from 'react';
import { submitReview } from '../../lib/api';

export default function ReviewModal({ nickname, onClose }) {
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (selected === null) return;
    setSending(true);
    try {
      await submitReview({ nickname: nickname || undefined, recommended: selected, comment: comment.trim() || undefined });
    } catch {
      // silencioso: no bloquear al usuario si falla
    }
    setSent(true);
    setTimeout(onClose, 1800);
  }

  return (
    <div className="rm-overlay">
      <div className="rm-box" onClick={(e) => e.stopPropagation()}>

        {sent ? (
          <div className="rm-success">
            <div className="rm-success-emoji">{selected ? '👍' : '👎'}</div>
            <div className="rm-success-text">GRACIAS POR TU OPINION</div>
          </div>
        ) : (
          <>
            <div className="rm-header">
              <div className="rm-tag">VALORACION DEL JUEGO</div>
              <div className="rm-title">Tu opinion me ayudaria a mejorar el juego</div>
              <div className="rm-subtitle">¿Recomendarias DevOps Disaster Simulator a otros jugadores?</div>
            </div>

            <div className="rm-thumbs">
              <button
                className={`rm-thumb-btn ${selected === true ? 'rm-thumb-btn--positive' : ''}`}
                onClick={() => setSelected(true)}
              >
                <span className="rm-thumb-emoji">👍</span>
                <span className="rm-thumb-label">Lo recomendaria</span>
              </button>
              <button
                className={`rm-thumb-btn ${selected === false ? 'rm-thumb-btn--negative' : ''}`}
                onClick={() => setSelected(false)}
              >
                <span className="rm-thumb-emoji">👎</span>
                <span className="rm-thumb-label">No lo recomendaria</span>
              </button>
            </div>

            <textarea
              className="rm-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comentario opcional..."
              maxLength={500}
              rows={3}
            />

            <div className="flex gap-2">
              <button
                className="btn-action btn-scale flex-1"
                onClick={handleSubmit}
                disabled={selected === null || sending}
                style={{ opacity: selected === null ? 0.4 : 1 }}
              >
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
              <button className="btn-action btn-ignore flex-1" onClick={onClose}>
                Saltar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
