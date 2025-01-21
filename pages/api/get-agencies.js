import db from '../../lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // ใช้ pool จาก db.js สำหรับ query
      const query = 'SELECT id_extage, name_extage, subname_extage FROM exteagency1';
      const [results] = await db.execute(query);

      res.status(200).json({ agencies: results });
    } catch (error) {
      console.error('Error fetching agencies:', error);
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
