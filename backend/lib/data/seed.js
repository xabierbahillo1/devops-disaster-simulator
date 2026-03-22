require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const { initDB, getPool } = require('./db');

const SEED_DATA = [
  { nickname: 'xabi_ops',     days: 42, uptime: 99.87, balance: 12450, clients: 7 },
  { nickname: 'sre_queen',    days: 38, uptime: 99.72, balance: 9820,  clients: 6 },
  { nickname: 'k8s_lord',     days: 35, uptime: 99.65, balance: 8100,  clients: 6 },
  { nickname: 'deploy_ninja', days: 30, uptime: 99.41, balance: 6340,  clients: 5 },
  { nickname: 'root42',       days: 28, uptime: 99.20, balance: 5200,  clients: 5 },
  { nickname: 'infra_punk',   days: 25, uptime: 98.90, balance: 3800,  clients: 4 },
  { nickname: 'pager_duty',   days: 22, uptime: 98.55, balance: 2900,  clients: 4 },
  { nickname: 'on_call_24_7', days: 18, uptime: 97.80, balance: 1200,  clients: 3 },
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
      await client.query(
        `INSERT INTO games (nickname, days, uptime, balance, clients, finished, end_reason)
         VALUES ($1, $2, $3, $4, $5, true, 'seed')`,
        [g.nickname, g.days, g.uptime, g.balance, g.clients]
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
