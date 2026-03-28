import { initDb, pool } from './_db.js';
import { emptyResponse, handleServerError, jsonResponse } from './_shared.js';

export function OPTIONS() {
  return emptyResponse();
}

export async function GET() {
  try {
    await initDb();
    const result = await pool.query('SELECT NOW() AS now');
    return jsonResponse({
      success: true,
      now: result.rows[0]?.now ?? null,
    });
  } catch (err) {
    return handleServerError(err);
  }
}
