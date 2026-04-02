/**
 * Kweza Attendance — Production Member Seed (calls Vercel API)
 * Run: node seed-members-prod.js
 * Set KWEZA_URL env var if your Vercel URL differs.
 */

const API = process.env.KWEZA_URL || 'https://kweza-attendance.vercel.app';

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

async function seed() {
  let inserted = 0, failed = 0;

  for (const m of members) {
    try {
      const res = await fetch(`${API}/api/people`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: m.name, shift: m.shift, mobile: '', memberId: m.memberId.trim(), pin: '1234' }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        console.log(`✅ Added:   ${m.name.padEnd(28)} ${m.memberId}`);
        inserted++;
      } else {
        console.log(`⚠️  Failed:  ${m.name} — ${JSON.stringify(data)}`);
        failed++;
      }
    } catch (err) {
      console.log(`❌ Error:   ${m.name} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone! ${inserted} added, ${failed} failed.`);
}

seed();
