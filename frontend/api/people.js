import { initDb, pool } from './_db.js';
import { emptyResponse, getJson, handleServerError, jsonResponse } from './_shared.js';

export function OPTIONS() {
  return emptyResponse();
}

export async function GET() {
  try {
    await initDb();
    const result = await pool.query('SELECT * FROM people ORDER BY id');
    return jsonResponse(result.rows);
  } catch (err) {
    return handleServerError(err);
  }
}

export async function POST(request) {
  try {
    await initDb();
    const { name, shift, mobile } = await getJson(request);
    if (!name || !shift) {
      return jsonResponse({ success: false, message: 'Missing data' }, 400);
    }

    const insert = await pool.query(
      'INSERT INTO people (name, shift, mobile) VALUES ($1, $2, $3) RETURNING *',
      [name, shift, mobile || null]
    );

    const created = insert.rows[0];
    if (created) return jsonResponse(created);

    const fallback = await pool.query('SELECT * FROM people ORDER BY id DESC LIMIT 1');
    return jsonResponse(fallback.rows[0] || {});
  } catch (err) {
    return handleServerError(err);
  }
}
