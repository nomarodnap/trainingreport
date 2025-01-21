import mysql from 'mysql2';

export default async function handler(req, res) {
  if (req.method === 'GET') {
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

    const query = 'SELECT id_extage, name_extage, subname_extage FROM exteagency1';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching agencies:', err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
        db.end();
        return;
      }

      res.status(200).json({ agencies: results });
      db.end();
    });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
