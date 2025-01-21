import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root', // แทนด้วยชื่อผู้ใช้ MySQL
  password: '', // แทนด้วยรหัสผ่าน MySQL
  database: 'hrd', // แทนด้วยชื่อฐานข้อมูล
};

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    // ดึง id_macou จาก body
    const { id_macou } = req.body;

    if (!id_macou) {
      return res.status(400).json({ error: 'กรุณาระบุ id_macou' });
    }

    try {
      // เชื่อมต่อกับฐานข้อมูล MySQL
      const connection = await mysql.createConnection(dbConfig);

      // สั่งลบข้อมูลจากตาราง course1 ตาม id_macou ที่ได้รับ
      const query = 'DELETE FROM course1 WHERE id_macou = ?';
      const [result] = await connection.execute(query, [id_macou]);

      connection.end();

      if (result.affectedRows > 0) {
        // ถ้าลบสำเร็จ
        res.status(200).json({ message: 'ลบคอร์สสำเร็จ' });
      } else {
        // ถ้าไม่พบข้อมูลที่ต้องการลบ
        res.status(404).json({ error: 'ไม่พบคอร์สที่ต้องการลบ' });
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบคอร์ส' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
