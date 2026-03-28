import { db, initDb } from './_db.js';
import { emptyResponse, getJson, jsonResponse } from './_shared.js';

export default async function handler(request) {
  if (request.method === 'OPTIONS') return emptyResponse();

  try {
    await initDb();

    if (request.method === 'GET') {
      const result = await db.execute({ sql: 'SELECT * FROM absence_reasons ORDER BY id' });
      return jsonResponse(result.rows);
    }

    if (request.method === 'POST') {
      const { personId, date, reason } = await getJson(request);
      if (!personId || !date || !reason) {
        return jsonResponse({ success: false, message: 'Missing data' }, 400);
      }

      await db.execute({
        sql: 'INSERT INTO absence_reasons (person_id, date, reason) VALUES (?, ?, ?)',
        args: [personId, date, reason],
      });

      return jsonResponse({ success: true });
    }

    return jsonResponse({ success: false, message: 'Method not allowed' }, 405);
  } catch (err) {
    return jsonResponse({ success: false, message: 'Server error' }, 500);
  }
}
