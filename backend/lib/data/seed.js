require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const { initDB, getPool } = require('./db');

// total_hours = days * 24, down_hours calculado a partir del uptime%
const SEED_DATA = [
  { nickname: 'LordUptime',      days: 42, balance: 12450, total_hours: 1008, down_hours: 1.31  },
  { nickname: 'NginxInavible',   days: 38, balance: 9820,  total_hours: 912,  down_hours: 2.55  },
  { nickname: 'ElSudoReloaded',  days: 35, balance: 8100,  total_hours: 840,  down_hours: 2.94  },
  { nickname: 'Captain_CICD',    days: 30, balance: 6340,  total_hours: 720,  down_hours: 4.25  },
  { nickname: 'git_push_force',  days: 28, balance: 5200,  total_hours: 672,  down_hours: 5.38  },
  { nickname: 'CronJobiWan',     days: 25, balance: 3800,  total_hours: 600,  down_hours: 6.60  },
  { nickname: 'SenorDeploy',     days: 22, balance: 2900,  total_hours: 528,  down_hours: 7.66  },
  { nickname: 'PodCrashLoop',    days: 18, balance: 1200,  total_hours: 432,  down_hours: 9.50  },
];

async function seed() {
  await initDB();
  const pool = getPool();

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM games');
  if (rows[0].count > 0) {
    console.log('[SEED] La tabla games ya tiene datos, saltando seed.');
    await pool.end();
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const g of SEED_DATA) {
      const uptime = g.total_hours > 0
        ? Math.round(((g.total_hours - g.down_hours) / g.total_hours) * 10000) / 100
        : 100;
      await client.query(
        `INSERT INTO games (nickname, days, total_hours, down_hours, uptime, balance, clients, finished, end_reason)
         VALUES ($1, $2, $3, $4, $5, $6, 0, true, 'seed')`,
        [g.nickname, g.days, g.total_hours, g.down_hours, uptime, g.balance]
      );
    }
    await client.query('COMMIT');
    console.log(`[SEED] ${SEED_DATA.length} registros insertados correctamente.`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('[SEED] Error:', err.message);
  process.exit(1);
});
