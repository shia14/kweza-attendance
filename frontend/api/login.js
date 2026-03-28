import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initDb, pool } from './_db.js';
import { emptyResponse, getJson, jsonResponse } from './_shared.js';

const SECRET_KEY = process.env.JWT_SECRET || 'kweza_secret_key';

export function OPTIONS() {
  return emptyResponse();
}

export async function POST(request) {
  try {
    await initDb();
    const { username, password } = await getJson(request);

    if (!username || !password) {
      return jsonResponse({ success: false, message: 'Missing credentials' }, 400);
    }

    const result = await pool.query(
      'SELECT id, username, password FROM admin WHERE username = $1',
      [username]
    );
    const admin = result.rows[0];

    if (admin && bcrypt.compareSync(password, admin.password)) {
      const token = jwt.sign(
        { id: admin.id, username: admin.username },
        SECRET_KEY,
        { expiresIn: '8h' }
      );
      return jsonResponse({ success: true, token });
    }

    return jsonResponse({ success: false, message: 'Invalid credentials' }, 401);
  } catch (err) {
    return jsonResponse({ success: false, message: 'Server error' }, 500);
  }
}
