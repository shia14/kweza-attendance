import { db, initDb } from './_db.js';
import { emptyResponse, jsonResponse } from './_shared.js';

export default async function handler(request) {
  if (request.method === 'OPTIONS') return emptyResponse();
  if (request.method !== 'GET') {
    return jsonResponse({ success: false, message: 'Method not allowed' }, 405);
  }

  try {
    await initDb();
    const result = await db.execute({ sql: 'SELECT * FROM attendance_logs ORDER BY id' });
    return jsonResponse(result.rows);
  } catch (err) {
    return jsonResponse({ success: false, message: 'Server error' }, 500);
  }
}
