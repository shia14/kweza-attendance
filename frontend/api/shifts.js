import { initDb, pool } from './_db.js';
import { emptyResponse, getJson, jsonResponse } from './_shared.js';

export function OPTIONS() {
  return emptyResponse();
}

export async function GET() {
  try {
    await initDb();
    const result = await pool.query('SELECT * FROM shift_rules ORDER BY shift');
    const formatted = result.rows.reduce((acc, rule) => {
      acc[rule.shift] = rule;
      return acc;
    }, {});
    return jsonResponse(formatted);
  } catch (err) {
    return jsonResponse({ success: false, message: 'Server error' }, 500);
  }
}

export async function PUT(request) {
  try {
    await initDb();
    const { Morning, Afternoon } = await getJson(request);
    if (!Morning || !Afternoon) {
      return jsonResponse({ success: false, message: 'Missing data' }, 400);
    }

    await pool.query(
      `UPDATE shift_rules
        SET scan_start = $1,
            scan_end = $2,
            departure_end = $3
        WHERE shift = 'Morning'`,
      [
        Morning.scan_start || Morning.scanStart,
        Morning.scan_end || Morning.scanEnd,
        Morning.departure_end || Morning.departureEnd,
      ]
    );

    await pool.query(
      `UPDATE shift_rules
        SET scan_start = $1,
            scan_end = $2,
            departure_end = $3
        WHERE shift = 'Afternoon'`,
      [
        Afternoon.scan_start || Afternoon.scanStart,
        Afternoon.scan_end || Afternoon.scanEnd,
        Afternoon.departure_end || Afternoon.departureEnd,
      ]
    );

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, message: 'Server error' }, 500);
  }
}
