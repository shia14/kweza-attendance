import { db, initDb } from './_db.js';
import { emptyResponse, getJson, jsonResponse } from './_shared.js';

export default async function handler(request) {
  if (request.method === 'OPTIONS') return emptyResponse();

  try {
    await initDb();

    if (request.method === 'GET') {
      const result = await db.execute({ sql: 'SELECT * FROM shift_rules ORDER BY shift' });
      const formatted = result.rows.reduce((acc, rule) => {
        acc[rule.shift] = rule;
        return acc;
      }, {});
      return jsonResponse(formatted);
    }

    if (request.method === 'PUT') {
      const { Morning, Afternoon } = await getJson(request);
      if (!Morning || !Afternoon) {
        return jsonResponse({ success: false, message: 'Missing data' }, 400);
      }

      await db.execute({
        sql: `UPDATE shift_rules
          SET scan_start = ?,
              scan_end = ?,
              departure_end = ?
          WHERE shift = 'Morning'`,
        args: [
          Morning.scan_start || Morning.scanStart,
          Morning.scan_end || Morning.scanEnd,
          Morning.departure_end || Morning.departureEnd,
        ],
      });

      await db.execute({
        sql: `UPDATE shift_rules
          SET scan_start = ?,
              scan_end = ?,
              departure_end = ?
          WHERE shift = 'Afternoon'`,
        args: [
          Afternoon.scan_start || Afternoon.scanStart,
          Afternoon.scan_end || Afternoon.scanEnd,
          Afternoon.departure_end || Afternoon.departureEnd,
        ],
      });

      return jsonResponse({ success: true });
    }

    return jsonResponse({ success: false, message: 'Method not allowed' }, 405);
  } catch (err) {
    return jsonResponse({ success: false, message: 'Server error' }, 500);
  }
}
