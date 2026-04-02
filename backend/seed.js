const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'attendance.db'));
const pin = '1234';
const stmt = db.prepare('INSERT OR IGNORE INTO people (name, shift, mobile, member_id, pin) VALUES (?, ?, ?, ?, ?)');

const members = [
  ['Felix Phiri',           'Morning', 'FON-2025-001'],
  ['Future Cherani',        'Morning', 'FON-2025-002'],
  ['Rodrick Mchochoma',     'Morning', 'FON-2025-003'],
  ['Jessie Chumbu',         'Morning', 'MEM-2025-001'],
  ['Alice Magombo',         'Morning', 'MEM-2025-003'],
  ['Yamikani Chimenya',     'Morning', 'MEM-2025-002'],
  ['Edwin Msilimba',        'Morning', 'MEM-2025-004'],
  ['Bridget F. Chinyanga',  'Morning', 'MEM-2025-005'],
  ['Jabulani B. Mayenda',   'Morning', 'MEM-2025-007'],
  ['Francis Ndeule',        'Morning', 'MEM-2025-008'],
  ['Isha Shaibu',           'Morning', 'CTM-2025-001'],
  ['Blessings Shia Phiri',  'Morning', 'CTM-2025-002'],
  ['Ellen Nyilenda',        'Morning', 'CTM-2026-001'],
  ['Antony Phiri',          'Morning', 'CTM-2026-002'],
  ['Jane Alex',             'Morning', 'CTM-2026-003'],
  ['Takondwa Zephania',     'Morning', 'CTM-2026-005'],
];

let added = 0, skipped = 0;
for (const [name, shift, id] of members) {
  const r = stmt.run(name, shift, null, id.trim(), pin);
  if (r.changes > 0) { console.log('Added:  ' + name + ' — ' + id); added++; }
  else { console.log('Skip:   ' + name + ' (already exists)'); skipped++; }
}
console.log('\nDone: ' + added + ' added, ' + skipped + ' skipped.');
db.close();
