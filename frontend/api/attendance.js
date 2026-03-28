import { initDb, pool } from './_db.js';
import { emptyResponse, jsonResponse } from './_shared.js';

export function OPTIONS() {
  return emptyResponse();
}

export async function GET() {
  try {
    await initDb();
    const result = await pool.query('SELECT * FROM attendance_logs ORDER BY id');
    return jsonResponse(result.rows);
  } catch (err) {
    return jsonResponse({ success: false, message: 'Server error' }, 500);
  }
}
