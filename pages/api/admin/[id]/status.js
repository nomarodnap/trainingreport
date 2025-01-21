import pool from '../../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { status } = req.body;

    // ตรวจสอบว่าสถานะที่ส่งมาเป็นค่าที่ถูกต้องหรือไม่
    if (!['admin', 'user', 'approver'].includes(status)) {
      return res.status(400).json({ message: 'สถานะไม่ถูกต้อง' });
    }

    try {
      // อัปเดตสถานะในฐานข้อมูล
      await updateUserStatusInDB(id, status); // เปลี่ยนเป็นฟังก์ชันจริงของคุณ
      res.status(200).json({ message: 'เปลี่ยนสถานะสำเร็จ' });
    } catch (error) {
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
