import pool from '../../lib/db';

export default async function handler(req, res) {
  try {
    const [rows] = await pool.query('SELECT NOW() AS now');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Database query failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}
