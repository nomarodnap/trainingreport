import { parse } from 'cookie';
import pool from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const cookies = parse(req.headers.cookie || '');
  const session = cookies.session;

  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  let username;
  try {
    const parsedSession = JSON.parse(session);
    username = parsedSession.username;
  } catch (e) {
    return res.status(400).json({ message: 'Invalid session format' });
  }

  const connection = await pool.getConnection();

  try {
    // อัปเดตให้เป็น 1 ตรง ๆ
    await connection.execute(
      'UPDATE users SET is_user_mode = 1 WHERE username = ?',
      [username]
    );

    res.status(200).json({ is_user_mode: 1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error setting user mode' });
  } finally {
    connection.release();
  }
}
