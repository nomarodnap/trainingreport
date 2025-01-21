import mysql from 'mysql2';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { id_extage } = req.body;

    if (!id_extage) {
      res.status(400).json({ message: 'กรุณาระบุ ID หน่วยงานที่ต้องการลบ' });
      return;
    }

    const db = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'hrd',
    });

    db.connect((err) => {
      if (err) {
        console.error('Database connection error:', err);
        res.status(500).json({ message: 'การเชื่อมต่อฐานข้อมูลล้มเหลว' });
        return;
      }
    });

    const query = 'DELETE FROM exteagency1 WHERE id_extage = ?';
    db.query(query, [id_extage], (err, result) => {
      if (err) {
        console.error('Error deleting agency:', err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
        db.end();
        return;
      }

      res.status(200).json({ message: 'ลบหน่วยงานสำเร็จ' });
      db.end();
    });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
