const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('[DB] Error inesperado en conexión idle:', err.message);
    });
  }
  return pool;
}

async function initDB() {
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id           SERIAL PRIMARY KEY,
        nickname     VARCHAR(50) NOT NULL,
        session_key  VARCHAR(32),
        days         INTEGER NOT NULL DEFAULT 1,
        total_hours  NUMERIC(10,2) NOT NULL DEFAULT 0,
        down_hours   NUMERIC(10,2) NOT NULL DEFAULT 0,
        uptime       NUMERIC(5,2) NOT NULL DEFAULT 100,
        balance      INTEGER NOT NULL DEFAULT 0,
        clients      INTEGER NOT NULL DEFAULT 2,
        finished     BOOLEAN NOT NULL DEFAULT false,
        end_reason   VARCHAR(20),
        state_json   JSONB,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_games_finished ON games(finished);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_games_ranking ON games(finished, balance DESC);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_games_session_key ON games(session_key) WHERE session_key IS NOT NULL;`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_games_nickname ON games(nickname);`);

    console.log('[DB] Schema inicializado correctamente');
  } finally {
    client.release();
  }
}

async function createGame(nickname, sessionKey) {
  const result = await getPool().query(
    `INSERT INTO games (nickname, session_key) VALUES ($1, $2) RETURNING id`,
    [nickname, sessionKey]
  );
  return result.rows[0].id;
}

async function updateGame(gameId, { days, uptime, balance, clients, totalHours, downHours }, stateJson) {
  await getPool().query(
    `UPDATE games
     SET days = $2, uptime = $3, balance = $4, clients = $5,
         total_hours = $6, down_hours = $7, state_json = $8, updated_at = NOW()
     WHERE id = $1`,
    [gameId, days, uptime, balance, clients, totalHours || 0, downHours || 0, stateJson || null]
  );
}

async function finishGame(gameId, { days, uptime, balance, clients, totalHours, downHours, endReason }) {
  await getPool().query(
    `UPDATE games
     SET days = $2, uptime = $3, balance = $4, clients = $5,
         total_hours = $6, down_hours = $7,
         finished = true, end_reason = $8, session_key = NULL, state_json = NULL, updated_at = NOW()
     WHERE id = $1`,
    [gameId, days, uptime, balance, clients, totalHours || 0, downHours || 0, endReason]
  );
}

async function clearSessionKey(gameId) {
  await getPool().query(
    `UPDATE games SET session_key = NULL WHERE id = $1`,
    [gameId]
  );
}

async function loadActiveSessions() {
  const result = await getPool().query(
    `SELECT id, nickname, session_key, state_json
     FROM games
     WHERE finished = false AND session_key IS NOT NULL AND state_json IS NOT NULL`
  );
  return result.rows;
}

async function getRanking({ page = 1, limit = 8, search = '' } = {}) {
  const hasSearch = search.trim().length > 0;
  const searchPattern = `%${search.trim()}%`;

  if (hasSearch) {
    // When searching, we need global rank positions assigned BEFORE filtering
    const countResult = await getPool().query(
      `SELECT COUNT(*)::int AS total FROM games WHERE finished = true AND nickname ILIKE $1`,
      [searchPattern]
    );

    const result = await getPool().query(
      `SELECT * FROM (
         SELECT nickname, days, total_hours, down_hours, balance, end_reason, created_at,
                ROW_NUMBER() OVER (ORDER BY balance DESC) AS global_rank
         FROM games WHERE finished = true
       ) ranked
       WHERE nickname ILIKE $1
       ORDER BY balance DESC
       LIMIT $2 OFFSET $3`,
      [searchPattern, limit, (page - 1) * limit]
    );

    return { rows: result.rows, total: countResult.rows[0].total };
  }

  // No search: simple paginated query
  const countResult = await getPool().query(
    `SELECT COUNT(*)::int AS total FROM games WHERE finished = true`
  );

  const result = await getPool().query(
    `SELECT nickname, days, total_hours, down_hours, balance, end_reason, created_at
     FROM games WHERE finished = true
     ORDER BY balance DESC LIMIT $1 OFFSET $2`,
    [limit, (page - 1) * limit]
  );

  return { rows: result.rows, total: countResult.rows[0].total };
}

module.exports = { initDB, getPool, createGame, updateGame, finishGame, clearSessionKey, loadActiveSessions, getRanking };
