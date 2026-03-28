import { initDb, pool } from './_db.js';
import { emptyResponse, getJson, jsonResponse } from './_shared.js';

const QR_VALUE = process.env.QR_VALUE || 'KWEZA-ATTENDANCE-CHECKIN';

export function OPTIONS() {
  return emptyResponse();
}

export async function POST(request) {
  try {
    await initDb();
    const { name, idNumber, scanType, qrValue } = await getJson(request);

    if (!name || !idNumber || !scanType || !qrValue) {
      return jsonResponse({ success: false, message: 'Missing scan data' }, 400);
    }

    if (qrValue !== QR_VALUE) {
      return jsonResponse({ success: false, message: 'Invalid QR code' }, 400);
    }

    const scannedAt = new Date().toISOString();
    const insert = await pool.query(
      `INSERT INTO scan_events (name, id_number, scan_type, qr_value, scanned_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING scanned_at`,
      [name, idNumber, scanType, qrValue, scannedAt]
    );

    const recordedAt = insert.rows[0]?.scanned_at || scannedAt;
    return jsonResponse({ success: true, scannedAt: recordedAt });
  } catch (err) {
    return jsonResponse({ success: false, message: 'Server error' }, 500);
  }
}
