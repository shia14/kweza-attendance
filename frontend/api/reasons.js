import { initDb, pool } from './_db.js';
import { emptyResponse, getJson, jsonResponse } from './_shared.js';

export function OPTIONS() {
  return emptyResponse();
}

export async function GET() {
  try {
    await initDb();
    const result = await pool.query('SELECT * FROM absence_reasons ORDER BY id');
    return jsonResponse(result.rows);
  } catch (err) {
    return jsonResponse({ success: false, message: 'Server error' }, 500);
  }
}

export async function POST(request) {
  try {
    await initDb();
    const { personId, date, reason } = await getJson(request);
    if (!personId || !date || !reason) {
      return jsonResponse({ success: false, message: 'Missing data' }, 400);
    }

    await pool.query(
      'INSERT INTO absence_reasons (person_id, date, reason) VALUES ($1, $2, $3)',
      [personId, date, reason]
    );

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, message: 'Server error' }, 500);
  }
}
