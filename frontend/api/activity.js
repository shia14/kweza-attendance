import { initDb, pool } from './_db.js';
import { emptyResponse, handleServerError, jsonResponse } from './_shared.js';

export function OPTIONS() {
  return emptyResponse();
}

export async function GET() {
  try {
    await initDb();
    const result = await pool.query('SELECT * FROM scan_events ORDER BY scanned_at DESC LIMIT 50');
    return jsonResponse(result.rows);
  } catch (err) {
    return handleServerError(err);
  }
}
