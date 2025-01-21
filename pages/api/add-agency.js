import db from '../../lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { subname_extage, name_extage } = req.body;

    // ตรวจสอบข้อมูลที่ได้รับ
    if (!subname_extage || !name_extage) {
      res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
      return;
    }

    try {
      // ใช้ pool จาก db.js ในการ query
      const query = `
        INSERT INTO exteagency1 (subname_extage, name_extage)
        VALUES (?, ?)
      `;

      // ใช้ await ในการ query
      const [result] = await db.query(query, [subname_extage, name_extage]);

      // ดึง `id_extage` ที่เพิ่มล่าสุด
      const newId = result.insertId;

      res.status(200).json({ message: 'เพิ่มหน่วยงานสำเร็จ', id: newId });
    } catch (error) {
      console.error('Error inserting data:', error);
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
