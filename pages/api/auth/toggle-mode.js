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
    const [rows] = await connection.execute(
      'SELECT is_user_mode FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const currentMode = rows[0].is_user_mode;
    const newMode = !currentMode;

    await connection.execute(
      'UPDATE users SET is_user_mode = ? WHERE username = ?',
      [newMode, username]
    );

    res.status(200).json({ is_user_mode: newMode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error toggling mode' });
  } finally {
    connection.release();
  }
}
