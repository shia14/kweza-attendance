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

    if (!name || !idNumber || !qrValue) {
      return jsonResponse({ success: false, message: 'Missing scan data' }, 400);
    }

    if (qrValue !== (process.env.QR_VALUE || 'KWEZA-ATTENDANCE-CHECKIN')) {
      return jsonResponse({ success: false, message: 'Invalid QR code' }, 400);
    }

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
    const insert = await pool.query(
      `INSERT INTO scan_events (name, id_number, scan_type, qr_value, scanned_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING scanned_at`,
      [name, idNumber, scanType, qrValue, scannedAt]
    );

    const recordedAt = insert.rows[0]?.scanned_at || scannedAt;
    return jsonResponse({ success: true, scanType, scannedAt: recordedAt });
  } catch (err) {
    return handleServerError(err);
  }
}
