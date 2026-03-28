import { db, initDb } from './_db.js';
import { emptyResponse, getJson, jsonResponse } from './_shared.js';

const QR_VALUE = process.env.QR_VALUE || 'KWEZA-ATTENDANCE-CHECKIN';

export default async function handler(request) {
  if (request.method === 'OPTIONS') return emptyResponse();
  if (request.method !== 'POST') {
    return jsonResponse({ success: false, message: 'Method not allowed' }, 405);
  }

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
    const insert = await db.execute({
      sql: `INSERT INTO scan_events (name, id_number, scan_type, qr_value, scanned_at)
        VALUES (?, ?, ?, ?, ?)
        RETURNING scanned_at`,
      args: [name, idNumber, scanType, qrValue, scannedAt],
    });

    const recordedAt = insert.rows[0]?.scanned_at || scannedAt;
    return jsonResponse({ success: true, scannedAt: recordedAt });
  } catch (err) {
    return jsonResponse({ success: false, message: 'Server error' }, 500);
  }
}
