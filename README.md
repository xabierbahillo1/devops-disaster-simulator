<div align="center">
  <img src="frontend/app/icon.png" alt="DevOps Disaster Simulator" width="80" />
  <h1>DevOps Disaster Simulator</h1>
  <p><strong>Gestiona servidores. Resuelve incidencias. Sobrevive.</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-14-000?logo=next.js" alt="Next.js 14" />
    <img src="https://img.shields.io/badge/Express-4-000?logo=express" alt="Express 4" />
    <img src="https://img.shields.io/badge/PostgreSQL-18-336791?logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

---

## Descripción

**DevOps Disaster Simulator** es un simulador interactivo en tiempo real donde asumes el rol de DevOps engineer de una startup tecnológica en crecimiento. Tu objetivo: gestionar la infraestructura, resolver incidencias variadas, mantener los SLAs de tus clientes y evitar que la empresa quiebre.

El juego simula horas y días en tiempo real (un tick cada 2 segundos) y presenta 8 tipos de incidencias distintas basadas en los desafíos reales de las operaciones en la nube.

## 🎮 Demo

**[Juega aquí → devops-sim.xabierbahillo.dev](https://devops-sim.xabierbahillo.dev/)**

---

## ✨ Características

- **Simulación en tiempo real** — el juego avanza cada 2 segundos con un motor de ticks que simula horas, días y tráfico variable según la hora del día.

- **8 tipos de incidencias** — memory leaks, DDoS, deploys rotos, discos llenos, slow queries, fallos de hardware, picos de tráfico y connection pools saturados.

- **Sistema de clientes con SLA** — 2 clientes iniciales y hasta 6 adicionales si mantienes buen uptime. Cada uno exige un SLA diferente (90% a 99.9%) con penalizaciones por incumplimiento.

- **Economía realista** — costes por vCPU, RAM y disco. Ingresos por cliente. Penalizaciones SLA. Quiebra si el balance cae por debajo de -$2000.

- **Terminal SSH simulada** — conéctate a cada servidor para diagnosticar problemas con salida realista de procesos, memoria, disco y logs.

- **Mentor interactivo (Dr. Kuberneto)** — tutorial guiado con efecto typewriter que enseña las mecánicas paso a paso, con alertas contextuales en momentos clave.

- **Ranking global persistente** — clasificación en PostgreSQL ordenada por balance final, con búsqueda y paginación.

---

## 🏗️ Arquitectura & Tech Stack

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS 3 |
| **Backend** | Node.js, Express 4 |
| **Base de datos** | PostgreSQL 18 |
| **Despliegue** | CubePath (Dokploy) |

---

## 🚀 Inicio Rápido

### Requisitos Previos

- [Node.js](https://nodejs.org/) >= 18
- [PostgreSQL](https://www.postgresql.org/) >= 14

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/xabierbahillo/devops-disaster-simulator.git
cd devops-disaster-simulator

# Instalar dependencias (frontend + backend)
npm run install:all
```

### Configuración

Crea un archivo `.env` en la carpeta `backend/`:

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/devops_sim
PORT=3001
```

Para producción (frontend y backend en dominios distintos), crea `.env.local` en `frontend/`:

```env
NEXT_PUBLIC_API_URL=https://tu-backend.ejemplo.com
```

Inicializa la base de datos:

```bash
npm run seed --prefix backend
```

### Ejecución Local

```bash
# Arrancar frontend (puerto 3000) y backend (puerto 3001) simultáneamente
npm run dev
```

Accede a [http://localhost:3000](http://localhost:3000).

---

## 🎯 Cómo se Juega

1. **Elige un nickname** y entra en la partida.
2. **El Dr. Kuberneto** te guía por el panel de control: servidores a la izquierda, métricas en el centro, clientes y logs a la derecha.
3. **Gestiona tu infraestructura** — compra servidores, escala recursos (CPU, RAM, disco) y monitoriza 3 servicios (web, backend, base de datos).
4. **Resuelve incidencias** — diagnostica por SSH y actúa: reiniciar, rollback, escalar o llamar al equipo de desarrollo.
5. **Mantén a tus clientes** — si el servicio cae, los clientes se quejan, reclaman compensación y pueden irse.
6. **Crece** — con buen uptime llegan clientes más grandes (ingresos mayores, SLAs más exigentes).
7. **No quiebres** — controla el balance entre ingresos y costes.

### Game Over

La partida termina cuando:
- **Quiebra**: balance < -$2000
- **Sin clientes**: todos rescinden

Tu puntuación se guarda en el ranking global.

---

## 📁 Estructura del Proyecto

```
devops-disaster-simulator/
├── backend/
│   ├── index.js                 # Entry point Express (puerto 3001)
│   ├── routes/                  # Endpoints API REST
│   ├── lib/
│   │   ├── core/                # Constantes, helpers, estado, logging
│   │   ├── engine/              # Motor de simulación (ticks, drift, status)
│   │   ├── game/                # Lógica de juego (acciones, clientes, eventos)
│   │   ├── infra/               # Diagnósticos SSH
│   │   └── data/                # PostgreSQL, sesiones, seed
│   ├── swagger.json             # OpenAPI docs
│   └── package.json
├── frontend/
│   ├── app/                     # Páginas Next.js (landing, game, ranking)
│   ├── components/              # Componentes UI
│   ├── hooks/                   # useGameState, useZoneRect
│   ├── lib/                     # Cliente API
│   ├── styles/                  # CSS global (Tailwind + custom)
│   ├── icon.png                 # Logo de la app
│   └── package.json
└── package.json                 # Monorepo root
```

---

## 📡 API REST

El backend expone una API REST documentada con Swagger en `/api-docs`:

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/session` | Crear partida |
| `DELETE` | `/api/session` | Terminar partida |
| `GET` | `/api/state` | Estado actual del juego |
| `POST` | `/api/action` | Ejecutar acción (reiniciar, escalar, rollback...) |
| `POST` | `/api/unpause` | Reanudar simulación |
| `GET` | `/api/ssh/:serverId` | Diagnósticos SSH |
| `GET` | `/api/ranking` | Clasificación global |

---

## 🌐 ¿Cómo Utiliza Este Proyecto CubePath?

Este proyecto está completamente desplegado en una **VPS `gp.nano` de CubePath** (1 vCPU, 2 GB RAM, 40 GB SSD, 3 TB ancho de banda) con **Dokploy**, una plataforma que simplifica el despliegue en producción.

**Arquitectura:**
- 3 contenedores Docker: Frontend (Next.js), Backend (Express) y PostgreSQL 18
- Build automático con Railpack
- Despliegue desde Git con webhooks automáticos
- Dominio personalizado `devops-sim.xabierbahillo.dev` con HTTPS (Let's Encrypt)
- Gestión automática de SSL, routing y salud de contenedores

---

## 📸 Capturas de Pantalla

### Pantalla Principal

![Landing Page](./docs/screenshots/landing.png)

*Pantalla de bienvenida y descripción del juego*

### Panel de Control

![Game Dashboard](./docs/screenshots/game-dashboard.png)

*Interfaz principal: servidores, métricas, clientes y logs en tiempo real*

### Terminal SSH

![SSH Terminal](./docs/screenshots/ssh-terminal.png)

*Diagnóstico interactivo de servidores con salida realista*

### Ranking Global

![Global Ranking](./docs/screenshots/ranking.png)

*Clasificación persistente de jugadores por balance final*

### Dr. Kuberneto (Mentor)

![Tutorial](./docs/screenshots/mentor.png)

*Tutor interactivo con explicaciones paso a paso*

---

<div align="center">
  <p><strong>Hecho por Xabier Bahillo</strong></p>
</div>
