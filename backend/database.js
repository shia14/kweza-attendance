const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'attendance.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    member_id TEXT UNIQUE,
    pin TEXT,
    shift TEXT NOT NULL,
    mobile TEXT,
    status TEXT DEFAULT 'Active',
    working_days TEXT DEFAULT 'Mon,Tue,Wed,Thu,Fri,Sat'
  );

  try { db.exec('ALTER TABLE people ADD COLUMN working_days TEXT DEFAULT "Mon,Tue,Wed,Thu,Fri,Sat"'); } catch (e) {}

  CREATE TABLE IF NOT EXISTS attendance_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER,
    date TEXT NOT NULL,
    check_in TEXT,
    check_out TEXT,
    status TEXT,
    FOREIGN KEY (person_id) REFERENCES people(id)
  );

  CREATE TABLE IF NOT EXISTS absence_reasons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER,
    date TEXT NOT NULL,
    reason TEXT,
    FOREIGN KEY (person_id) REFERENCES people(id)
  );

  CREATE TABLE IF NOT EXISTS shift_rules (
    shift TEXT PRIMARY KEY,
    scan_start TEXT,
    scan_end TEXT,
    departure_end TEXT
  );

  CREATE TABLE IF NOT EXISTS scan_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    id_number TEXT NOT NULL,
    scan_type TEXT NOT NULL,
    qr_value TEXT NOT NULL,
    scanned_at TEXT NOT NULL
  );
`);

// Seed initial admin if not exists
const adminCount = db.prepare('SELECT count(*) as count FROM admin').get();
if (adminCount.count === 0) {
  const bcrypt = require('bcryptjs');
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO admin (username, password) VALUES (?, ?)').run('admin', hashedPassword);
}

// Seed default shift rules if not exists
const ruleCount = db.prepare('SELECT count(*) as count FROM shift_rules').get();
if (ruleCount.count === 0) {
  db.prepare('INSERT INTO shift_rules (shift, scan_start, scan_end, departure_end) VALUES (?, ?, ?, ?)').run('Morning', '07:00', '08:30', '12:30');
  db.prepare('INSERT INTO shift_rules (shift, scan_start, scan_end, departure_end) VALUES (?, ?, ?, ?)').run('Afternoon', '13:00', '14:30', '18:30');
}

module.exports = db;
