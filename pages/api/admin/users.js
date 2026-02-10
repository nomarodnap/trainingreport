import pool from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // ดึงข้อมูล nickname มาด้วย
      const [users] = await pool.query(`
        SELECT 
          id,
          username,
          email,
          title,
          first_name,
          last_name,
          phone_number,
          type,
          position,
          level,
          department,
          group_name,
          under_department1,
          under_department2,
          status,
          nickname  -- 👈 เพิ่มตรงนี้
        FROM users
        WHERE username REGEXP '^[0-9]+$';
      `);

      res.status(200).json({ users });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
