'use client';

import { useRef, useEffect, useCallback } from 'react';
import useGameState from '../../hooks/useGameState';
import useMobileScale from '../../hooks/useMobileScale';
import { AudioProvider, useAudioSettings } from '../../context/AudioContext';
import GameHeader from '../../components/game/GameHeader';
import InfraPanel from '../../components/game/InfraPanel';
import MetricsChart from '../../components/game/MetricsChart';
import ActiveIncidents from '../../components/game/ActiveIncidents';
import ServicesPanel from '../../components/game/ServicesPanel';
import ClientsPanel from '../../components/game/ClientsPanel';
import LogPanel from '../../components/game/LogPanel';
import ServerModal from '../../components/game/ServerModal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ActionToast from '../../components/ui/ActionToast';
import GameOver from '../../components/game/GameOver';
import LoadingScreen from '../../components/game/LoadingScreen';
import ResetDialog from '../../components/game/ResetDialog';
import MobileRotatePrompt from '../../components/game/MobileRotatePrompt';
import Mentor from '../../components/mentor/Mentor';
import MobileChat from '../../components/game/MobileChat';

export default function GamePage() {
  return (
    <AudioProvider>
      <GamePageInner />
    </AudioProvider>
  );
}

function GamePageInner() {
  const { ready, isMobile, isPortrait, scale, scaledHeight } = useMobileScale();

  const {
    data, nickname, openServer, setOpenServerId,
    actionFeedback, confirmData, setConfirmData,
    resetConfirm, setResetConfirm,
    showBuyMenu, setShowBuyMenu,
    showIntro, showFirstDown, showNewClient, showBankruptWarning,
    handleAction, handleConfirm, handleBuyServer, handleReset,
    closeIntro, closeFirstDown, closeNewClient, closeBankruptWarning,
    showPhoneCall, phoneUnlocked, hasUnread, markUnread, showMobileChat,
    closePhoneCall, openMobileChat, closeMobileChat,
  } = useGameState();

  const { setMusicState, playSFX } = useAudioSettings();

  const prevDown = useRef(false);
  useEffect(() => {
    if (!data) return;
    const isDown = (data.services || []).some(s => s.status === 'red');
    setMusicState(isDown ? 'incident' : 'normal');
    prevDown.current = isDown;
  }, [data, setMusicState]);

  // alerta cuando aparece una incidencia nueva
  const prevEventIds = useRef(new Set());
  useEffect(() => {
    if (!data) return;
    const current = new Set((data.activeEvents || []).map(e => e.id));
    for (const id of current) {
      if (!prevEventIds.current.has(id)) {
        playSFX('alert');
        break;
      }
    }
    prevEventIds.current = current;
  }, [data, playSFX]);

  const actionWithSFX = useCallback(async (...args) => {
    playSFX('click');
    return handleAction(...args);
  }, [handleAction, playSFX]);

  const confirmWithSFX = useCallback(async () => {
    playSFX('click');
    return handleConfirm();
  }, [handleConfirm, playSFX]);

  const buyServerWithSFX = useCallback(async (type) => {
    playSFX('click');
    return handleBuyServer(type);
  }, [handleBuyServer, playSFX]);

  const openServerWithSFX = useCallback((id) => {
    playSFX('click');
    setOpenServerId(id);
  }, [setOpenServerId, playSFX]);

  useEffect(() => {
    if (!actionFeedback) return;
    playSFX(actionFeedback.success ? 'correct' : 'error');
  }, [actionFeedback, playSFX]);

  const handleAiMessage = useCallback(() => {
    if (!showMobileChat) markUnread();
  }, [showMobileChat, markUnread]);

  if (ready && isPortrait) return <MobileRotatePrompt />;

  if (!data || !nickname) return <LoadingScreen />;

  const gt  = data.gameTime || {};
  const fin = data.finance  || {};

  const mentorActive = showIntro || showFirstDown || showNewClient || showBankruptWarning || showPhoneCall;

  const scaled = isMobile && scale < 1;

  const gameContent = (
    <div
      className="grid-bg game-root"
      style={{
        background: '#060b12',
        ...(scaled ? { height: scaledHeight, minHeight: 0, overflow: 'hidden' } : {}),
      }}
    >
      <GameHeader
        data={data}
        nickname={nickname}
        onExit={() => setResetConfirm(true)}
        phoneUnlocked={phoneUnlocked}
        hasUnread={hasUnread}
        onOpenChat={openMobileChat}
      />

      <main
        className={`flex-1 grid gap-2.5 p-2.5${!scaled ? ' grid-cols-1 md:grid-cols-2 xl:grid-cols-[280px_1fr_300px] xl:overflow-hidden xl:min-h-0' : ''}`}
        style={scaled ? {
          gridTemplateColumns: '280px 1fr 300px',
          overflow: 'hidden',
          minHeight: 0,
        } : {}}
      >
        <InfraPanel
          servers={data.servers}
          showBuyMenu={showBuyMenu}
          onToggleBuyMenu={() => setShowBuyMenu(!showBuyMenu)}
          onBuyServer={buyServerWithSFX}
          onOpenServer={openServerWithSFX}
        />

        <div
          className={`flex flex-col gap-2${!scaled ? ' xl:overflow-hidden xl:min-w-0' : ''}`}
          style={scaled ? { overflow: 'hidden', minWidth: 0 } : {}}
          data-zone="metrics"
        >
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: '#6888a8', letterSpacing: '0.18em', paddingLeft: 4, paddingBottom: 2 }}>
            MÉTRICAS E INCIDENTES
          </div>
          <MetricsChart servers={data.servers || []} history={data.metricsHistory || {}} />
          <div className={`flex flex-col gap-2${!scaled ? ' xl:overflow-auto' : ''}`} style={scaled ? { overflowY: 'auto' } : {}}>
            <ActiveIncidents events={data.activeEvents || []} onOpenServer={openServerWithSFX} />
          </div>
        </div>

        <div
          className={`flex flex-col gap-2${!scaled ? ' md:col-span-2 xl:col-span-1 xl:overflow-hidden' : ''}`}
          style={scaled ? { overflow: 'hidden' } : {}}
          data-zone="right"
        >
          <ServicesPanel services={data.services} />
          <ClientsPanel clients={data.clients} consecutiveDownHours={data.consecutiveDownHours} />
          <div
            className={!scaled ? 'xl:flex-1 xl:overflow-hidden xl:min-h-0' : ''}
            style={{ minHeight: 200, ...(scaled ? { flex: 1, overflow: 'hidden', minHeight: 0 } : {}) }}
          >
            <LogPanel logs={data.logs || []} />
          </div>
        </div>
      </main>

      {openServer && !mentorActive && (
        <ServerModal server={openServer} onAction={actionWithSFX} onClose={() => setOpenServerId(null)} />
      )}

      {!mentorActive && <ConfirmDialog data={confirmData} onConfirm={confirmWithSFX} onCancel={() => setConfirmData(null)} />}

      <GameOver
        reason={data.bankrupt ? 'bankrupt' : data.noClients ? 'no_clients' : null}
        fin={fin} gt={gt} clients={data.clients} onReset={handleReset}
      />

      {showNewClient && (
        <Mentor
          scale={scale}
          messages={[
            { text: `¡Buenas noticias, ${nickname}! ${showNewClient.name} quiere contratar nuestros servicios. Han firmado un SLA del ${showNewClient.sla}% y pagarán $${showNewClient.revenuePerHour}/h.`, zone: 'right' },
            { text: 'Más clientes significa más carga en los servidores. Revisa que la infraestructura aguante bien: CPU, RAM y disco. Si algo va justo, escala antes de que sea tarde.', zone: 'servers' },
            { text: 'Recuerda: si no cumplimos el SLA, vendrán las penalizaciones. ¡A por ello!' },
          ]}
          onClose={closeNewClient}
        />
      )}

      {showFirstDown && (() => {
        const downService = (data.services || []).find(s => s.status === 'red');
        const downName = downService ? downService.name : 'un servicio';
        return (
          <Mentor
            scale={scale}
            messages={[
              { text: `¡${nickname}! Tenemos una emergencia. El servicio "${downName}" está caído. Los clientes están sin servicio ahora mismo.`, zone: 'right' },
              { text: 'Revisa los incidentes activos, entra al servidor afectado y diagnostica el problema. Puedes conectarte por SSH para ver qué está pasando.', zone: 'metrics' },
              { text: 'Dependiendo del problema, tendrás que reiniciar, escalar recursos, hacer rollback o llamar al equipo de desarrollo. Cada minuto cuenta: el SLA se está degradando.', zone: 'servers' },
              { text: '¡Actúa rápido! Te dejo trabajar.' },
            ]}
            onClose={closeFirstDown}
          />
        );
      })()}

      {showBankruptWarning && (() => {
        const balance = Math.round((fin.totalRevenue || 0) - (fin.totalCost || 0));
        return (
          <Mentor
            scale={scale}
            messages={[
              { text: `${nickname}, tenemos un problema serio. El balance de la empresa ha caído a $${balance}. Si seguimos así, la quiebra es inminente.`, zone: 'hud' },
              { text: 'Si el balance cae por debajo de -$2000, la empresa quiebra y todo se acaba. ¡Actúa ya!' },
            ]}
            onClose={closeBankruptWarning}
          />
        );
      })()}

      {showIntro && (
        <Mentor
          scale={scale}
          messages={[
            { text: `Bienvenido a bordo, ${nickname}. Soy el Dr. Kuberneto, fundador y CTO de la empresa. Llevamos tiempo buscando a alguien que se encargue de nuestra infraestructura... y ese alguien eres tú.` },
            { text: 'Acabamos de arrancar. Tenemos un par de clientes pequeños y tres servidores: uno web, uno de backend y una base de datos. Recursos mínimos, pero suficientes para empezar.' },
            { text: 'Arriba tienes tu panel de control: la fecha y hora, el uptime del servicio, los costes de infraestructura y el balance de la empresa. No pierdas de vista el balance... si cae demasiado, cerramos.', zone: 'hud' },
            { text: 'A la izquierda están tus servidores. Puedes entrar en cada uno para ver sus métricas, conectarte por SSH, escalar recursos o ejecutar acciones como reiniciar o hacer rollback.', zone: 'servers' },
            { text: 'En el centro tienes las métricas en tiempo real y los incidentes activos. Cuando algo falle, aparecerá ahí. Haz clic para investigar.', zone: 'metrics' },
            { text: 'A la derecha están los servicios, los clientes y el registro de eventos. Los clientes tienen SLAs exigentes: si el servicio cae demasiado tiempo, se irán... y con ellos, los ingresos.', zone: 'right' },
            { text: 'Si mantienes todo estable, vendrán clientes más grandes. Más ingresos, pero también más carga y SLAs más duros. Tendrás que escalar la infraestructura para aguantar.' },
            { text: 'Una última cosa: los problemas llegarán. Memory leaks, deploys rotos, DDoS, discos llenos... Tu trabajo es detectarlos a tiempo y actuar rápido. Buena suerte, la vas a necesitar.' },
          ]}
          onClose={closeIntro}
        />
      )}

      {showPhoneCall && (
        <Mentor
          scale={scale}
          messages={[
            { text: '¡Espera! ¿Oyes eso? Creo que te están escribiendo al móvil...' },
            { text: 'Ahí, ese icono. Ábrelo, puede ser alguien del sector. Los primeros días en un nuevo trabajo siempre viene bien tener a alguien de confianza a quien preguntar.', zone: 'phone-btn' },
          ]}
          onClose={closePhoneCall}
        />
      )}

      {!mentorActive && (
        <MobileChat
          isOpen={showMobileChat}
          onClose={closeMobileChat}
          onAiMessage={handleAiMessage}
          gameData={data}
          nickname={nickname}
        />
      )}

      {resetConfirm && !mentorActive && <ResetDialog onConfirm={handleReset} onCancel={() => setResetConfirm(false)} />}

      <ActionToast feedback={actionFeedback} />
    </div>
  );

  if (scaled) {
    return (
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#060b12' }}>
        <div style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: 1280,
          height: scaledHeight,
        }}>
          {gameContent}
        </div>
      </div>
    );
  }

  return gameContent;
}
