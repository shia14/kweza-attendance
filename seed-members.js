/**
 * Kweza Attendance — Member Seed Script
 * Inserts all 16 members into the local SQLite database directly.
 * Run from the project root:  node seed-members.js
 */

const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'backend', 'attendance.db');
const db = new Database(dbPath);

// All 16 members.
// Shift is assigned Morning by default — change if needed.
// PIN 1234.
const members = [
  { name: 'Felix Phiri',              memberId: 'FON-2025-001', shift: 'Morning' },
  { name: 'Future Cherani',           memberId: 'FON-2025-002', shift: 'Morning' },
  { name: 'Rodrick Mchochoma',        memberId: 'FON-2025-003', shift: 'Morning' },
  { name: 'Jessie Chumbu',            memberId: 'MEM-2025-001', shift: 'Morning' },
  { name: 'Alice Magombo',            memberId: 'MEM-2025-003', shift: 'Morning' },
  { name: 'Yamikani Chimenya',        memberId: 'MEM-2025-002', shift: 'Morning' },
  { name: 'Edwin Msilimba',           memberId: 'MEM-2025-004', shift: 'Morning' },
  { name: 'Bridget F. Chinyanga',     memberId: 'MEM-2025-005', shift: 'Morning' },
  { name: 'Jabulani B. Mayenda',      memberId: 'MEM-2025-007', shift: 'Morning' },
  { name: 'Francis Ndeule',           memberId: 'MEM-2025-008', shift: 'Morning' },
  { name: 'Isha Shaibu',              memberId: 'CTM-2025-001', shift: 'Morning' },
  { name: 'Blessings Shia Phiri',     memberId: 'CTM-2025-002', shift: 'Morning' },
  { name: 'Ellen Nyilenda',           memberId: 'CTM-2026-001', shift: 'Morning' },
  { name: 'Antony Phiri',             memberId: 'CTM-2026-002', shift: 'Morning' },
  { name: 'Jane Alex',                memberId: 'CTM-2026-003', shift: 'Morning' },
  { name: 'Takondwa Zephania',        memberId: 'CTM-2026-005', shift: 'Morning' },
];

const pin = '1234';
const stmt = db.prepare(
  'INSERT OR IGNORE INTO people (name, shift, mobile, member_id, pin) VALUES (?, ?, ?, ?, ?)'
);

let inserted = 0;
let skipped  = 0;

for (const m of members) {
  const info = stmt.run(m.name, m.shift, null, m.memberId.trim(), pin);
  if (info.changes > 0) {
    console.log(`✅ Added:   ${m.name.padEnd(28)} ${m.memberId}`);
    inserted++;
  } else {
    console.log(`⏭️  Skipped (already exists): ${m.name} — ${m.memberId}`);
    skipped++;
  }
}

console.log(`\nDone! ${inserted} added, ${skipped} skipped.`);
db.close();
