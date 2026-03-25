'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { sendChatMessage } from '../../../lib/api';
import ContactAvatar from './ContactAvatar';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const CONTACT_NAME = 'Yamlito';
const WELCOME_MESSAGE = '¿Qué tal tus primeros días en el nuevo trabajo? 😄\nYa sabes que puedes contar conmigo para cualquier duda que tengas, como siempre.';

function formatTime() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

function buildGameContext(gameData) {
  if (!gameData) return {};
  return {
    day: gameData.gameTime?.day,
    hour: gameData.gameTime?.hour,
    incidents: gameData.activeEvents || [],
    servicesStatus: Object.fromEntries(
      (gameData.services || []).map(s => [s.name, s.status])
    ),
    economy: gameData.finance,
    uptime: gameData.uptime?.actual,
  };
}

export default function MobileChat({ isOpen, onClose, gameData, nickname }) {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const welcomeSent  = useRef(false);
  const messagesEnd  = useRef(null);
  const inputRef     = useRef(null);

  const addMessage = useCallback((from, text) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), from, text, time: formatTime() }]);
  }, []);

  // primer mensaje al abrir el chat
  useEffect(() => {
    if (isOpen && !welcomeSent.current) {
      welcomeSent.current = true;
      setTimeout(() => addMessage('ai', WELCOME_MESSAGE), 600);
    }
  }, [isOpen, addMessage]);

  // scroll al ultimo mensaje
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // foco al textarea al abrir
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  // cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    addMessage('user', text);
    setLoading(true);

    try {
      const history = messages.slice(-12).map(m => ({ from: m.from, text: m.text }));
      const { reply } = await sendChatMessage(text, history, buildGameContext(gameData));
      addMessage('ai', reply || 'No pude procesar eso. ¿Lo repites?');
    } catch {
      addMessage('ai', 'Uy, problemas de red por mi lado. Intentalo de nuevo. 📡');
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, loading, messages, addMessage, gameData]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  if (!isOpen) return null;

  return (
    <div className="chat-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="chat-container">

        <div className="chat-header">
          <ContactAvatar />
          <div>
            <div className="chat-header-name">{CONTACT_NAME}</div>
            <div className={`chat-header-status${loading ? ' chat-header-status--typing' : ''}`}>
              {loading ? 'escribiendo...' : 'en linea'}
            </div>
          </div>
          <button className="chat-close-btn" onClick={onClose} aria-label="Cerrar chat">✕</button>
        </div>


        <div className="chat-messages">
          {messages.length === 0 && !loading && (
            <div className="chat-empty">Conectando con Yamlito...</div>
          )}
          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
          {loading && <TypingIndicator />}
          <div ref={messagesEnd} />
        </div>

        <div className="chat-input-bar">
          <textarea
            ref={inputRef}
            className="chat-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Escribe un mensaje..."
            rows={1}
          />
          <button
            className="chat-send-btn"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            aria-label="Enviar"
          >
            ➤
          </button>
        </div>

      </div>
    </div>
  );
}
