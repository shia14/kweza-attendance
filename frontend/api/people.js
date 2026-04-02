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
    const { name, shift, mobile, memberId, pin } = await getJson(request);
    if (!name || !shift) {
      return jsonResponse({ success: false, message: 'Missing data' }, 400);
    }

    const insert = await pool.query(
      'INSERT INTO people (name, shift, mobile, member_id, pin) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, shift, mobile || null, memberId || null, pin || null]
    );

    const created = insert.rows[0];
    if (created) return jsonResponse(created);

    const fallback = await pool.query('SELECT * FROM people ORDER BY id DESC LIMIT 1');
    return jsonResponse(fallback.rows[0] || {});
  } catch (err) {
    return handleServerError(err);
  }
}

export async function PUT(request) {
  try {
    await initDb();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return jsonResponse({ success: false, message: 'Missing ID' }, 400);

    const { name, shift, mobile, pin } = await getJson(request);
    if (!name || !shift) {
      return jsonResponse({ success: false, message: 'Missing name or shift' }, 400);
    }

    const result = await pool.query(
      `UPDATE people SET name=$1, shift=$2, mobile=$3, pin=COALESCE(NULLIF($4,''), pin)
       WHERE id=$5 RETURNING *`,
      [name, shift, mobile || null, pin || null, id]
    );

    if (result.rows.length === 0) {
      return jsonResponse({ success: false, message: 'Person not found' }, 404);
    }
    return jsonResponse(result.rows[0]);
  } catch (err) {
    return handleServerError(err);
  }
}

export async function DELETE(request) {
  try {
    await initDb();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return jsonResponse({ success: false, message: 'Missing ID' }, 400);

    // Delete attendance logs and reasons first to maintain integrity
    await pool.query('DELETE FROM attendance_logs WHERE person_id = $1', [id]);
    await pool.query('DELETE FROM absence_reasons WHERE person_id = $1', [id]);
    await pool.query('DELETE FROM people WHERE id = $1', [id]);
    
    return jsonResponse({ success: true });
  } catch (err) {
    return handleServerError(err);
  }
}
