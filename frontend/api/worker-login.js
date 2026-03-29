import { initDb, pool } from './_db.js';
import { emptyResponse, getJson, handleServerError, jsonResponse } from './_shared.js';

export function OPTIONS() {
  return emptyResponse();
}

export async function POST(request) {
  try {
    await initDb();
    const { memberId, pin } = await getJson(request);

    if (!memberId || !pin) {
      return jsonResponse({ success: false, message: 'Missing login data' }, 400);
    }

    const workerResult = await pool.query(
      'SELECT * FROM people WHERE member_id = $1 AND pin = $2 AND status = $3',
      [memberId, pin, 'Active']
    );

    if (workerResult.rows.length > 0) {
      return jsonResponse({ success: true, worker: workerResult.rows[0] });
    } else {
      return jsonResponse({ success: false, message: 'Invalid Member ID or PIN' }, 401);
    }
  } catch (err) {
    return handleServerError(err);
  }
}
