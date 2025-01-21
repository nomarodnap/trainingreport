import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Query ข้อมูลทั้งหมดจากตาราง users
      const [rows] = await pool.query('SELECT * FROM users ORDER BY id ASC');
      res.status(200).json({ users: rows });
    } catch (error) {
      console.error('Database Error:', error);
      res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
