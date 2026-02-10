// /pages/api/user/mode.js
import mysql from 'mysql2/promise';
import { getSession } from '../auth/session'; // หรือ path ที่ถูกต้องของ session function ที่คุณใช้

export default async function handler(req, res) {
  try {
    const session = await getSession(req); // ✅ ใช้แค่สำหรับดึง username/userId
    if (!session || !session.username) {
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
      [session.username]
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
