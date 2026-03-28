import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initDb, pool } from './_db.js';
import { emptyResponse, getAuthToken, getJson, jsonResponse } from './_shared.js';

const SECRET_KEY = process.env.JWT_SECRET || 'kweza_secret_key';

export default async function handler(request) {
  if (request.method === 'OPTIONS') return emptyResponse();
  if (request.method !== 'POST') {
    return jsonResponse({ success: false, message: 'Method not allowed' }, 405);
  }

  try {
    await initDb();
    const token = getAuthToken(request);
    if (!token) return jsonResponse({ success: false, message: 'Unauthorized' }, 401);

    let decoded;
    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch {
      return jsonResponse({ success: false, message: 'Invalid token' }, 401);
    }

    const { currentPassword, newPassword } = await getJson(request);
    if (!currentPassword || !newPassword) {
      return jsonResponse({ success: false, message: 'Missing data' }, 400);
    }

    const adminResult = await pool.query(
      'SELECT id, password FROM admin WHERE id = $1',
      [decoded.id]
    );
    const admin = adminResult.rows[0];

    if (!admin || !bcrypt.compareSync(currentPassword, admin.password)) {
      return jsonResponse({ success: false, message: 'Current password incorrect' }, 400);
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await pool.query(
      'UPDATE admin SET password = $1 WHERE id = $2',
      [hashedPassword, admin.id]
    );

    return jsonResponse({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    return jsonResponse({ success: false, message: 'Server error' }, 500);
  }
}
