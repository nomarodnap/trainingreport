import db from '../../lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { id_extage } = req.body;

    if (!id_extage) {
      res.status(400).json({ message: 'กรุณาระบุ ID หน่วยงานที่ต้องการลบ' });
      return;
    }

    try {
      // ใช้ pool จาก db.js สำหรับการ query
      const query = 'DELETE FROM exteagency1 WHERE id_extage = ?';
      const [result] = await db.execute(query, [id_extage]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'ไม่พบหน่วยงานที่ต้องการลบ' });
      }

      res.status(200).json({ message: 'ลบหน่วยงานสำเร็จ' });
    } catch (error) {
      console.error('Error deleting agency:', error);
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
