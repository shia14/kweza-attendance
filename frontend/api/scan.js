import { initDb, pool } from './_db.js';
import { emptyResponse, getJson, handleServerError, jsonResponse } from './_shared.js';

const QR_VALUE = process.env.QR_VALUE || 'KWEZA-ATTENDANCE-CHECKIN';

export function OPTIONS() {
  return emptyResponse();
}

export async function POST(request) {
  try {
    await initDb();
    const { name, idNumber, qrValue } = await getJson(request);

    if (!idNumber || !qrValue) {
      return jsonResponse({ success: false, message: 'Missing scan data' }, 400);
    }

    if (qrValue !== (process.env.QR_VALUE || 'KWEZA-ATTENDANCE-CHECKIN')) {
      return jsonResponse({ success: false, message: 'Invalid QR code' }, 400);
    }

    // Find person
    const personResult = await pool.query('SELECT * FROM people WHERE member_id = $1', [idNumber]);
    if (personResult.rows.length === 0) {
      return jsonResponse({ success: false, message: 'Worker not found' }, 404);
    }
    const person = personResult.rows[0];

    // Determine scan type
    const today = new Date().toISOString().split('T')[0];
    const lastScanResult = await pool.query(
      `SELECT scan_type FROM scan_events 
       WHERE id_number = $1 AND DATE(scanned_at) = $2 
       ORDER BY scanned_at DESC LIMIT 1`,
      [idNumber, today]
    );

    let scanType = 'arrival';
    if (lastScanResult.rows.length > 0 && lastScanResult.rows[0].scan_type === 'arrival') {
      scanType = 'departure';
    }

    const scannedAt = new Date().toISOString();
    const timeStr = new Date(scannedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

    // Save to scan_events
    await pool.query(
      `INSERT INTO scan_events (name, id_number, scan_type, qr_value, scanned_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [person.name, idNumber, scanType, qrValue, scannedAt]
    );

    // Update attendance_logs
    if (scanType === 'arrival') {
      // Check if late
      const shiftRulesResult = await pool.query('SELECT * FROM shift_rules WHERE shift = $1', [person.shift]);
      const rules = shiftRulesResult.rows[0];
      let status = 'Attended';
      
      if (rules && rules.scan_start) {
         if (timeStr > rules.scan_end) {
            status = 'Late';
         }
      }

      await pool.query(
        `INSERT INTO attendance_logs (person_id, date, check_in, status)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`, // Assuming unique constraint on (person_id, date) if added, or handle manually
         [person.id, today, timeStr, status]
      );
      
      // Since no unique constraint yet, let's just update if exists
      const existing = await pool.query('SELECT id FROM attendance_logs WHERE person_id = $1 AND date = $2', [person.id, today]);
      if (existing.rows.length > 0) {
          await pool.query('UPDATE attendance_logs SET check_in = $1, status = $2 WHERE id = $3', [timeStr, status, existing.rows[0].id]);
      } else {
          await pool.query('INSERT INTO attendance_logs (person_id, date, check_in, status) VALUES ($1, $2, $3, $4)', [person.id, today, timeStr, status]);
      }

    } else {
      await pool.query(
        `UPDATE attendance_logs SET check_out = $1 
         WHERE person_id = $2 AND date = $3`,
        [timeStr, person.id, today]
      );
    }

    return jsonResponse({ success: true, scanType, scannedAt });
  } catch (err) {
    return handleServerError(err);
  }
}
