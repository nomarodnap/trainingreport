import * as Sentry from '@sentry/nextjs';
import { parse, serialize } from 'cookie';
import pool from '../../../lib/db';
import { attachSessionUserContext, sanitizeErrorForLog } from '../../../lib/sentry';

export default async function handler(req, res) {
  // รองรับเฉพาะ GET
  if (req.method !== 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // ✅ กำหนด Content-Type ล่วงหน้า
  res.setHeader('Content-Type', 'application/json');
  // ✅ Prevent Caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  const cookies = parse(req.headers.cookie || '');
  const session = cookies.session;

  // ❌ ไม่มี session cookie → Unauthorized
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  let username;
  try {
    const parsedSession = JSON.parse(session);
    username = parsedSession.username;
  } catch (e) {
    // ❌ session format ผิด → Bad request
    return res.status(400).json({ message: 'Invalid session format' });
  }

  attachSessionUserContext(req, { username });

  const startedAt = Date.now();
  const connection = await pool.getConnection();

  try {
    // 🔍 ดึงข้อมูลผู้ใช้จาก DB
    const [rows] = await connection.execute(
      'SELECT id, username, status, department, group_name, type, is_user_mode FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userRow = rows[0];
    attachSessionUserContext(req, {
      id: userRow.id,
      username: userRow.username,
      status: userRow.status,
      department: userRow.department,
      group_name: userRow.group_name,
      type: userRow.type,
    });
    Sentry.setAttribute('user.is_user_mode', Boolean(userRow.is_user_mode));

    // ♻️ รีเฟรช cookie session (อายุ 30 นาที)
    const expires = new Date(Date.now() + 30 * 60 * 1000);
    const newCookie = serialize('session', session, {
      httpOnly: true,
      path: '/',
      expires,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    res.setHeader('Set-Cookie', newCookie);

    // ✅ ส่งข้อมูลผู้ใช้กลับในรูปแบบ JSON เสมอ
    return res.status(200).json({
      username: userRow.username,
      status: userRow.status,
      is_user_mode: userRow.is_user_mode,
    });

  } catch (error) {
    const safeErr = sanitizeErrorForLog(error);
    Sentry.logger.error('Session lookup failed', {
      duration_ms: Date.now() - startedAt,
      status: 'error',
      http_status: 500,
      ...safeErr,
    });
    Sentry.captureException(error);
    console.error('❌ /api/auth/session error:', safeErr.error_message);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
}
