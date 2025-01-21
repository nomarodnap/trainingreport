import pool from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Query ดึงข้อมูลผู้ใช้จากฐานข้อมูล
      const [users] = await pool.query(`
        SELECT id, username, email, first_name, last_name, phone_number, position, level, department, group_name, under_department1, under_department2, status
        FROM users
      `);
      res.status(200).json({ users });
    } catch (error) {
      console.error('Database error:', error); // Debug ข้อผิดพลาดใน Console
      res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
