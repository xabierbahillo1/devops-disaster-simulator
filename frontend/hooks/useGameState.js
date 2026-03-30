'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { sendAction, unpauseSimulation, endSession, fetchState } from '../lib/api';

const fetcher = () => fetchState();

export default function useGameState() {
  const router = useRouter();
  const { data, error, mutate } = useSWR('/api/state', fetcher, {
    refreshInterval: 2000,
    onError: (err) => {
      // Sesion expirada o backend reiniciado, volvemos al landing
      if (err.status === 401) {
        sessionStorage.removeItem('sessionKey');
        sessionStorage.removeItem('introSeen');
        router.replace('/');
      }
    },
  });

  const [actionFeedback, setActionFeedback] = useState(null);
  const [openServerId, setOpenServerId]     = useState(null);
  const [confirmData, setConfirmData]       = useState(null);
  const [resetConfirm, setResetConfirm]     = useState(false);
  const [showBuyMenu, setShowBuyMenu]       = useState(false);
  const [nickname, setNickname]             = useState(null);
  const [showIntro, setShowIntro]                   = useState(false);
  const [showFirstDown, setShowFirstDown]           = useState(false);
  const [showNewClient, setShowNewClient]           = useState(null);
  const [showBankruptWarning, setShowBankruptWarning] = useState(false);
  const [showPhoneCall, setShowPhoneCall]   = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [hasUnread, setHasUnread]           = useState(false);
  const [chatMessages, setChatMessages]     = useState([]);
  const firstDownHandled = useRef(false);
  const newClientHandled = useRef(false);
  const bankruptWarningHandled = useRef(false);
  const phoneCallHandled = useRef(false);

  // Verificar sesion y cargar nick
  useEffect(() => {
    const nick = localStorage.getItem('playerNick');
    const key = sessionStorage.getItem('sessionKey');
    if (!nick || !key) { router.replace('/'); return; }
    setNickname(nick);
    firstDownHandled.current = false;
    setShowFirstDown(false);
    const introSeen = sessionStorage.getItem('introSeen');
    if (!introSeen) {
      setShowIntro(true);
    } else {
      unpauseSimulation();
    }
  }, [router]);

  // Detectar primera caida de servidor
  useEffect(() => {
    if (data?.pauseReason === 'first_down' && !firstDownHandled.current && !showIntro) {
      firstDownHandled.current = true;
      setShowFirstDown(true);
    }
  }, [data?.pauseReason, showIntro]);

  // Detectar advertencia de quiebra inminente
  useEffect(() => {
    if (data?.pauseReason === 'bankrupt_warning' && !bankruptWarningHandled.current && !showIntro) {
      bankruptWarningHandled.current = true;
      setShowBankruptWarning(true);
    }
    if (data?.pauseReason !== 'bankrupt_warning') {
      bankruptWarningHandled.current = false;
    }
  }, [data?.pauseReason, showIntro]);

  // Mostrar mentor la primera vez que llega el evento de llamada amigo
  useEffect(() => {
    if (data?.pauseReason === 'phone_call' && !phoneCallHandled.current && !showIntro) {
      phoneCallHandled.current = true;
      setShowPhoneCall(true);
      setHasUnread(true);
    }
  }, [data?.pauseReason, showIntro]);

  // Detectar llegada de nuevo cliente
  useEffect(() => {
    if (data?.pauseReason === 'new_client' && data?.newClient && !newClientHandled.current && !showIntro) {
      newClientHandled.current = true;
      setShowNewClient(data.newClient);
    }
    if (data?.pauseReason !== 'new_client') {
      newClientHandled.current = false;
    }
  }, [data?.pauseReason, data?.newClient, showIntro]);

  const handleAction = useCallback(async (type, targetId, params) => {
    const result = await sendAction(type, targetId, params);
    if (result.needsConfirmation) {
      setConfirmData({ type, targetId, params, ...result });
      return;
    }
    setActionFeedback(result);
    setTimeout(() => setActionFeedback(null), 3000);
    mutate();
  }, [mutate]);

  const handleConfirm = useCallback(async () => {
    if (!confirmData) return;
    const { type, targetId, params, estimate } = confirmData;
    const confirmedParams = { ...params, confirmed: true, issueId: estimate?.issueId };
    const result = await sendAction(type, targetId, confirmedParams);
    setConfirmData(null);
    setActionFeedback(result);
    setTimeout(() => setActionFeedback(null), 3000);
    mutate();
  }, [confirmData, mutate]);

  const handleBuyServer = useCallback(async (serverType) => {
    setShowBuyMenu(false);
    await handleAction('purchase_server', 'new', { serverType });
  }, [handleAction]);

  const handleReset = useCallback(async () => {
    setResetConfirm(false);
    await endSession().catch(() => {});
    const nick = localStorage.getItem('playerNick') || '';
    localStorage.removeItem('playerNick');
    localStorage.removeItem('infra-server-order');
    localStorage.removeItem('metrics-server-order');
    sessionStorage.removeItem('introSeen');
    sessionStorage.removeItem('sessionKey');
    const encoded = encodeURIComponent(btoa(nick));
    router.push(`/?r=${encoded}`);
  }, [router]);

  const closeIntro = useCallback(() => {
    setShowIntro(false);
    sessionStorage.setItem('introSeen', '1');
    unpauseSimulation();
  }, []);

  const closeFirstDown = useCallback(() => {
    setShowFirstDown(false);
    unpauseSimulation();
  }, []);

  const closeNewClient = useCallback(() => {
    setShowNewClient(null);
    unpauseSimulation();
  }, []);

  const closeBankruptWarning = useCallback(() => {
    setShowBankruptWarning(false);
    unpauseSimulation();
  }, []);

  const closePhoneCall = useCallback(() => {
    setShowPhoneCall(false);
    unpauseSimulation();
  }, []);

  const openMobileChat = useCallback(() => {
    setShowMobileChat(true);
    setHasUnread(false);
  }, []);

  const closeMobileChat = useCallback(() => {
    setShowMobileChat(false);
  }, []);

  const markUnread = useCallback(() => {
    setHasUnread(true);
  }, []);

  const addChatMessage = useCallback((from, text, time) => {
    setChatMessages(prev => [...prev, { id: Date.now() + Math.random(), from, text, time }]);
  }, []);

  const clearChatMessages = useCallback(() => {
    setChatMessages([]);
  }, []);

  const openServer = openServerId ? (data?.servers || []).find(s => s.id === openServerId) : null;

  return {
    data,
    nickname,
    openServer,
    openServerId,
    setOpenServerId,
    actionFeedback,
    confirmData,
    setConfirmData,
    resetConfirm,
    setResetConfirm,
    showBuyMenu,
    setShowBuyMenu,
    showIntro,
    showFirstDown,
    showNewClient,
    showBankruptWarning,
    handleAction,
    handleConfirm,
    handleBuyServer,
    handleReset,
    closeIntro,
    closeFirstDown,
    closeNewClient,
    closeBankruptWarning,
    showPhoneCall,
    phoneUnlocked: !!data?.phoneCallShown,
    hasUnread,
    markUnread,
    showMobileChat,
    closePhoneCall,
    openMobileChat,
    closeMobileChat,
    chatMessages,
    addChatMessage,
    clearChatMessages,
  };
}
