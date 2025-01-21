import mysql from 'mysql2';
import db from '../../lib/db.js';


export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { subname_extage, name_extage } = req.body;

    // ตรวจสอบข้อมูลที่ได้รับ
    if (!subname_extage || !name_extage) {
      res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
      return;
    }

    db.connect((err) => {
      if (err) {
        console.error('Database connection error:', err);
        res.status(500).json({ message: 'การเชื่อมต่อฐานข้อมูลล้มเหลว' });
        return;
      }
    });

    // คำสั่ง SQL สำหรับการเพิ่มหน่วยงาน โดยไม่ต้องกำหนด `id_extage`
    const query = `
      INSERT INTO exteagency1 (subname_extage, name_extage)
      VALUES (?, ?)
    `;

    db.query(query, [subname_extage, name_extage], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
        db.end();
        return;
      }

      // ดึง `id_extage` ที่เพิ่มล่าสุด
      const newId = result.insertId;
      res.status(200).json({ message: 'เพิ่มหน่วยงานสำเร็จ', id: newId });
      db.end();
    });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
