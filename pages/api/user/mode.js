// /pages/api/user/mode.js
import mysql from 'mysql2/promise';
import { parse } from 'cookie';

export default async function handler(req, res) {
  // ✅ Prevent Caching (Fix Issue: User A sees User B's data)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  try {
    const cookies = parse(req.headers.cookie || '');
    const sessionCookie = cookies.session;

    let username;
    try {
      const parsedSession = JSON.parse(sessionCookie);
      username = parsedSession.username;
    } catch (e) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    if (!username) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [rows] = await connection.execute(
      'SELECT status, is_user_mode FROM users WHERE username = ?',
      [username]
    );

    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      status: rows[0].status,
      is_user_mode: rows[0].is_user_mode === 1,
    });
  } catch (err) {
    console.error('Error loading user mode:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
