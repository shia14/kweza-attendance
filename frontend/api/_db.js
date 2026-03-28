import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const connectionString =
  process.env.SUPABASE_DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

const connectionLabel =
  process.env.SUPABASE_DATABASE_URL ? 'SUPABASE_DATABASE_URL' :
  process.env.SUPABASE_DB_URL ? 'SUPABASE_DB_URL' :
  process.env.DATABASE_URL ? 'DATABASE_URL' :
  process.env.POSTGRES_URL ? 'POSTGRES_URL' :
  process.env.POSTGRES_URL_NON_POOLING ? 'POSTGRES_URL_NON_POOLING' :
  null;

const pool = connectionString
  ? (globalThis.__pgPool ||
      new Pool({
        connectionString,
        max: 1,
        allowExitOnIdle: true,
        connectionTimeoutMillis: 10000,
        ssl: { rejectUnauthorized: false },
      }))
  : null;

if (pool && !globalThis.__pgPool) {
  globalThis.__pgPool = pool;
}

let initialized = false;

export async function initDb() {
  if (initialized) return;
  if (!pool) {
    throw new Error('Missing database connection string. Set POSTGRES_URL or SUPABASE_DATABASE_URL in Vercel.');
  }

  try {
    const parsed = new URL(connectionString);
    console.log('Initializing database with', {
      source: connectionLabel,
      host: parsed.hostname,
      port: parsed.port,
      database: parsed.pathname?.replace('/', ''),
    });
  } catch {
    console.log('Initializing database with', { source: connectionLabel });
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS people (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      shift TEXT NOT NULL,
      mobile TEXT,
      status TEXT DEFAULT 'Active'
    );

    CREATE TABLE IF NOT EXISTS attendance_logs (
      id SERIAL PRIMARY KEY,
      person_id INTEGER REFERENCES people(id),
      date TEXT NOT NULL,
      check_in TEXT,
      check_out TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS absence_reasons (
      id SERIAL PRIMARY KEY,
      person_id INTEGER REFERENCES people(id),
      date TEXT NOT NULL,
      reason TEXT
    );

    CREATE TABLE IF NOT EXISTS shift_rules (
      shift TEXT PRIMARY KEY,
      scan_start TEXT,
      scan_end TEXT,
      departure_end TEXT
    );

    CREATE TABLE IF NOT EXISTS scan_events (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      id_number TEXT NOT NULL,
      scan_type TEXT NOT NULL,
      qr_value TEXT NOT NULL,
      scanned_at TIMESTAMPTZ NOT NULL
    );
  `);

  const adminCount = await pool.query('SELECT COUNT(*)::int AS count FROM admin');
  if ((adminCount.rows[0]?.count ?? 0) === 0) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    await pool.query(
      'INSERT INTO admin (username, password) VALUES ($1, $2)',
      ['admin', hashedPassword]
    );
  }

  const ruleCount = await pool.query('SELECT COUNT(*)::int AS count FROM shift_rules');
  if ((ruleCount.rows[0]?.count ?? 0) === 0) {
    await pool.query(
      `INSERT INTO shift_rules (shift, scan_start, scan_end, departure_end)
       VALUES
        ('Morning', '07:00', '08:30', '12:30'),
        ('Afternoon', '13:00', '14:30', '18:30')`
    );
  }

  initialized = true;
}

export { pool };
