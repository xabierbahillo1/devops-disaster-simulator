'use client';

import useGameState from '../../hooks/useGameState';
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
import Mentor from '../../components/mentor/Mentor';

export default function GamePage() {
  const {
    data, nickname, openServer, setOpenServerId,
    actionFeedback, confirmData, setConfirmData,
    resetConfirm, setResetConfirm,
    showBuyMenu, setShowBuyMenu,
    showIntro, showFirstDown, showNewClient,
    handleAction, handleConfirm, handleBuyServer, handleReset,
    closeIntro, closeFirstDown, closeNewClient,
  } = useGameState();

  if (!data || !nickname) return <LoadingScreen />;

  const gt  = data.gameTime || {};
  const fin = data.finance  || {};

  return (
    <div className="grid-bg game-root" style={{ background: '#060b12' }}>
      <GameHeader data={data} nickname={nickname} onExit={() => setResetConfirm(true)} />

      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[280px_1fr_300px] gap-2.5 p-2.5 xl:overflow-hidden xl:min-h-0">
        {/* Columna izquierda: servidores */}
        <InfraPanel
          servers={data.servers}
          showBuyMenu={showBuyMenu}
          onToggleBuyMenu={() => setShowBuyMenu(!showBuyMenu)}
          onBuyServer={handleBuyServer}
          onOpenServer={setOpenServerId}
        />

        {/* Columna central: metricas e incidentes */}
        <div className="flex flex-col gap-2 xl:overflow-hidden xl:min-w-0" data-zone="metrics">
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: '#6888a8', letterSpacing: '0.18em', paddingLeft: 4, paddingBottom: 2 }}>
            MÉTRICAS E INCIDENTES
          </div>
          <MetricsChart servers={data.servers || []} history={data.metricsHistory || {}} />
          <div className="xl:overflow-auto flex flex-col gap-2">
            <ActiveIncidents events={data.activeEvents || []} onOpenServer={setOpenServerId} />
          </div>
        </div>

        {/* Columna derecha: servicios, clientes y logs */}
        <div className="flex flex-col gap-2 md:col-span-2 xl:col-span-1 xl:overflow-hidden" data-zone="right">
          <ServicesPanel services={data.services} />
          <ClientsPanel clients={data.clients} consecutiveDownHours={data.consecutiveDownHours} />
          <div className="xl:flex-1 xl:overflow-hidden xl:min-h-0" style={{ minHeight: 200 }}>
            <LogPanel logs={data.logs || []} />
          </div>
        </div>
      </main>

      {openServer && (
        <ServerModal server={openServer} onAction={handleAction} onClose={() => setOpenServerId(null)} />
      )}

      <ConfirmDialog data={confirmData} onConfirm={handleConfirm} onCancel={() => setConfirmData(null)} />

      <GameOver
        reason={data.bankrupt ? 'bankrupt' : data.noClients ? 'no_clients' : null}
        fin={fin} gt={gt} clients={data.clients} onReset={handleReset}
      />

      {showNewClient && (
        <Mentor
          messages={[
            { text: `¡Buenas noticias, ${nickname}! ${showNewClient.name} quiere contratar nuestros servicios. Han firmado un SLA del ${showNewClient.sla}% y pagarán $${showNewClient.revenuePerHour}/h.`, zone: 'right' },
            { text: 'Más clientes significa más carga en los servidores. Revisa que la infraestructura aguante bien: CPU, RAM y disco. Si algo va justo, escala antes de que sea tarde.', zone: 'servers' },
            { text: 'Recuerda: si no cumplimos el SLA, vendrán las penalizaciones. ¡A por ello!' },
          ]}
          onClose={closeNewClient}
        />
      )}

      {showFirstDown && (() => {
        const downServer = (data.servers || []).find(s => s.down);
        const downName = downServer ? downServer.name : 'uno de tus servidores';
        return (
          <Mentor
            messages={[
              { text: `¡${nickname}! Tenemos una emergencia. ${downName} se ha caído. Los clientes están sin servicio ahora mismo.` },
              { text: 'Revisa los incidentes activos, entra al servidor afectado y diagnostica el problema. Puedes conectarte por SSH para ver qué está pasando.', zone: 'metrics' },
              { text: 'Dependiendo del problema, tendrás que reiniciar, escalar recursos, hacer rollback o llamar al equipo de desarrollo. Cada minuto cuenta: el SLA se está degradando.', zone: 'servers' },
              { text: '¡Actúa rápido! Te dejo trabajar.' },
            ]}
            onClose={closeFirstDown}
          />
        );
      })()}

      {showIntro && (
        <Mentor
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

      {resetConfirm && <ResetDialog onConfirm={handleReset} onCancel={() => setResetConfirm(false)} />}

      <ActionToast feedback={actionFeedback} />
    </div>
  );
}
