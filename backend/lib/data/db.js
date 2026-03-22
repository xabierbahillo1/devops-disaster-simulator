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
        id          SERIAL PRIMARY KEY,
        nickname    VARCHAR(50) NOT NULL,
        session_key VARCHAR(32),
        days        INTEGER NOT NULL DEFAULT 1,
        uptime      NUMERIC(5,2) NOT NULL DEFAULT 100,
        balance     INTEGER NOT NULL DEFAULT 0,
        clients     INTEGER NOT NULL DEFAULT 2,
        finished    BOOLEAN NOT NULL DEFAULT false,
        end_reason  VARCHAR(20),
        state_json  JSONB,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_games_finished ON games(finished);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_games_ranking ON games(finished, days DESC, uptime DESC);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_games_session_key ON games(session_key) WHERE session_key IS NOT NULL;`);

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

async function updateGame(gameId, { days, uptime, balance, clients }, stateJson) {
  await getPool().query(
    `UPDATE games
     SET days = $2, uptime = $3, balance = $4, clients = $5, state_json = $6, updated_at = NOW()
     WHERE id = $1`,
    [gameId, days, uptime, balance, clients, stateJson || null]
  );
}

async function finishGame(gameId, { days, uptime, balance, clients, endReason }) {
  await getPool().query(
    `UPDATE games
     SET days = $2, uptime = $3, balance = $4, clients = $5,
         finished = true, end_reason = $6, session_key = NULL, state_json = NULL, updated_at = NOW()
     WHERE id = $1`,
    [gameId, days, uptime, balance, clients, endReason]
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

async function getRanking(limit = 50) {
  const result = await getPool().query(
    `SELECT nickname, days, uptime, balance, clients, end_reason, created_at
     FROM games
     WHERE finished = true
     ORDER BY days DESC, uptime DESC, balance DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

module.exports = { initDB, getPool, createGame, updateGame, finishGame, clearSessionKey, loadActiveSessions, getRanking };
