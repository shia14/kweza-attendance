import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const dbUrl =
  process.env.TURSO_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'file:local.db';

const dbAuthToken =
  process.env.TURSO_AUTH_TOKEN ||
  process.env.DATABASE_AUTH_TOKEN ||
  undefined;

export const db = createClient({
  url: dbUrl,
  authToken: dbAuthToken,
});

let initialized = false;

export async function initDb() {
  if (initialized) return;

  await db.batch([
    {
      sql: `CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )`,
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS people (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        shift TEXT NOT NULL,
        mobile TEXT,
        status TEXT DEFAULT 'Active'
      )`,
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS attendance_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        person_id INTEGER,
        date TEXT NOT NULL,
        check_in TEXT,
        check_out TEXT,
        status TEXT,
        FOREIGN KEY (person_id) REFERENCES people(id)
      )`,
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS absence_reasons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        person_id INTEGER,
        date TEXT NOT NULL,
        reason TEXT,
        FOREIGN KEY (person_id) REFERENCES people(id)
      )`,
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS shift_rules (
        shift TEXT PRIMARY KEY,
        scan_start TEXT,
        scan_end TEXT,
        departure_end TEXT
      )`,
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS scan_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        id_number TEXT NOT NULL,
        scan_type TEXT NOT NULL,
        qr_value TEXT NOT NULL,
        scanned_at TEXT NOT NULL
      )`,
    },
  ]);

  const adminCount = await db.execute({
    sql: 'SELECT COUNT(*) AS count FROM admin',
  });

  const adminTotal = Number(adminCount.rows[0]?.count ?? 0);
  if (adminTotal === 0) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    await db.execute({
      sql: 'INSERT INTO admin (username, password) VALUES (?, ?)',
      args: ['admin', hashedPassword],
    });
  }

  const ruleCount = await db.execute({
    sql: 'SELECT COUNT(*) AS count FROM shift_rules',
  });

  const ruleTotal = Number(ruleCount.rows[0]?.count ?? 0);
  if (ruleTotal === 0) {
    await db.batch([
      {
        sql: 'INSERT INTO shift_rules (shift, scan_start, scan_end, departure_end) VALUES (?, ?, ?, ?)',
        args: ['Morning', '07:00', '08:30', '12:30'],
      },
      {
        sql: 'INSERT INTO shift_rules (shift, scan_start, scan_end, departure_end) VALUES (?, ?, ?, ?)',
        args: ['Afternoon', '13:00', '14:30', '18:30'],
      },
    ]);
  }

  initialized = true;
}
