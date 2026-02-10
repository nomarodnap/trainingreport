import { getSession } from 'next-auth/react';
import mysql from 'mysql2/promise';
import { dbConfig } from '../../../lib/db'; // หรือไฟล์ config ที่คุณใช้

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  const connection = await mysql.createConnection(dbConfig);

  try {
    const [rows] = await connection.execute(
      'SELECT is_user_mode FROM users WHERE username = ?',
      [session.username]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const currentMode = rows[0].is_user_mode;
    const newMode = !currentMode;

    await connection.execute(
      'UPDATE users SET is_user_mode = ? WHERE username = ?',
      [newMode, session.username]
    );

    res.status(200).json({ is_user_mode: newMode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error toggling mode' });
  } finally {
    await connection.end();
  }
}
