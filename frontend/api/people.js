import { db, initDb } from './_db.js';
import { emptyResponse, getJson, jsonResponse } from './_shared.js';

export default async function handler(request) {
  if (request.method === 'OPTIONS') return emptyResponse();

  try {
    await initDb();

    if (request.method === 'GET') {
      const result = await db.execute({ sql: 'SELECT * FROM people ORDER BY id' });
      return jsonResponse(result.rows);
    }

    if (request.method === 'POST') {
      const { name, shift, mobile } = await getJson(request);
      if (!name || !shift) {
        return jsonResponse({ success: false, message: 'Missing data' }, 400);
      }

      const insert = await db.execute({
        sql: 'INSERT INTO people (name, shift, mobile) VALUES (?, ?, ?) RETURNING *',
        args: [name, shift, mobile || null],
      });

      const created = insert.rows[0];
      if (created) return jsonResponse(created);

      const fallback = await db.execute({ sql: 'SELECT * FROM people ORDER BY id DESC LIMIT 1' });
      return jsonResponse(fallback.rows[0] || {});
    }

    return jsonResponse({ success: false, message: 'Method not allowed' }, 405);
  } catch (err) {
    return jsonResponse({ success: false, message: 'Server error' }, 500);
  }
}
