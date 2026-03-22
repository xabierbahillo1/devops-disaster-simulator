// Tick timing
const TICK_MS            = 2000;
const TICK_MS_DEGRADED   = 3500;
const TICK_MS_DOWN       = 5000;
const GAME_HOURS_PER_TICK = 2;

// Precios de infra (por hora de juego)
const COST_VCPU_HR    = 0.25;
const COST_RAM_GB_HR  = 0.15;
const COST_DISK_GB_HR = 0.003;

const MONTHLY_BUDGET = 2000;

// Costes de desarrollo
const DEV_COST_BASE   = 50;
const DEV_HOURLY_RATE = 80;

const SCALE_INSTABILITY_CHANCE = 0.12;

// Contratos SLA y clientes

const INITIAL_CLIENTS = [
  { name: 'BlogTech S.L.',       sla: 95.0, revenuePerHour: 4.5,  penaltyPerHour: 6,   penaltyEscalation: 1.1, loadFactor: 0.18 },
  { name: 'StartupLabs',         sla: 90.0, revenuePerHour: 3.5,  penaltyPerHour: 4,   penaltyEscalation: 1.0, loadFactor: 0.12 },
];

const POTENTIAL_CLIENTS = [
  { name: 'E-Shop Express',      sla: 97.0, revenuePerHour: 10.0, penaltyPerHour: 20,  penaltyEscalation: 1.2, loadFactor: 0.28, minUptime: 95.0, minDays: 2 },
  { name: 'DataFlow Analytics',  sla: 98.0, revenuePerHour: 14.0, penaltyPerHour: 35,  penaltyEscalation: 1.3, loadFactor: 0.33, minUptime: 96.0, minDays: 4 },
  { name: 'FinanzaPro',          sla: 99.0, revenuePerHour: 20.0, penaltyPerHour: 65,  penaltyEscalation: 1.4, loadFactor: 0.42, minUptime: 97.5, minDays: 6 },
  { name: 'TechCorp S.L.',       sla: 99.5, revenuePerHour: 28.0, penaltyPerHour: 110, penaltyEscalation: 1.5, loadFactor: 0.52, minUptime: 98.5, minDays: 9 },
  { name: 'MediSalud (sanidad)', sla: 99.9, revenuePerHour: 40.0, penaltyPerHour: 200, penaltyEscalation: 1.8, loadFactor: 0.62, minUptime: 99.0, minDays: 14 },
  { name: 'GovPortal (público)', sla: 99.9, revenuePerHour: 55.0, penaltyPerHour: 380, penaltyEscalation: 2.0, loadFactor: 0.72, minUptime: 99.5, minDays: 20 },
];

// Umbrales de quiebra y downtime

const BANKRUPTCY_BALANCE = -2000;

const DOWNTIME_WARNING_HOURS  = 2;
const DOWNTIME_CLAIM_HOURS    = 4;
const DOWNTIME_CRITICAL_HOURS = 8;
const DOWNTIME_CHURN_HOURS    = 16;

// Curva de trafico por hora (multiplicador 0-1, indice 0-23)

const TRAFFIC_CURVE = [
  0.15, 0.10, 0.08, 0.08, 0.10, 0.15,
  0.25, 0.50, 0.75, 0.90, 0.95, 1.00,
  0.95, 1.00, 0.95, 0.90, 0.85, 0.80,
  0.70, 0.55, 0.40, 0.30, 0.25, 0.20,
];

// Plantillas de servidores y compras

const SERVER_TEMPLATES = {
  web:      { type: 'web',      role: 'Servidor Web',              os: 'Ubuntu 22.04 LTS', subnet: '10.0.1', baseSpecs: { cpuCores: 2, ramGB: 4, diskGB: 50 } },
  backend:  { type: 'backend',  role: 'Servidor Backend',           os: 'Ubuntu 22.04 LTS', subnet: '10.0.2', baseSpecs: { cpuCores: 4, ramGB: 8, diskGB: 100 } },
  database: { type: 'database', role: 'Base de Datos PostgreSQL',  os: 'Ubuntu 22.04 LTS', subnet: '10.0.3', baseSpecs: { cpuCores: 4, ramGB: 16, diskGB: 200 } },
};

const PURCHASE_SETUP_FEE   = { web: 1200, backend: 2000, database: 3000 };
const PURCHASE_PROVISION_TICKS = 2;

module.exports = {
  TICK_MS, TICK_MS_DEGRADED, TICK_MS_DOWN, GAME_HOURS_PER_TICK,
  COST_VCPU_HR, COST_RAM_GB_HR, COST_DISK_GB_HR,
  MONTHLY_BUDGET, DEV_COST_BASE, DEV_HOURLY_RATE,
  SCALE_INSTABILITY_CHANCE,
  INITIAL_CLIENTS, POTENTIAL_CLIENTS,
  BANKRUPTCY_BALANCE,
  DOWNTIME_WARNING_HOURS, DOWNTIME_CLAIM_HOURS, DOWNTIME_CRITICAL_HOURS, DOWNTIME_CHURN_HOURS,
  TRAFFIC_CURVE,
  SERVER_TEMPLATES, PURCHASE_SETUP_FEE, PURCHASE_PROVISION_TICKS,
};
