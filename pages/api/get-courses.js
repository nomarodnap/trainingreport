import mysql from 'mysql2/promise';

// สร้าง pool การเชื่อมต่อกับฐานข้อมูล TiDB Cloud
const pool = mysql.createPool({
  uri: 'mysql://3EeJcMMMM163GFF.root:Qa0etDSUJ87J3bQs@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/hrd?sslMode=VERIFY_IDENTITY', // ใช้ Connection String จาก Environment Variable
  waitForConnections: true,
  connectionLimit: 10, // กำหนดจำนวนการเชื่อมต่อพร้อมกัน
  queueLimit: 0, // จำกัดจำนวนคำขอในคิว
  ssl: {
    rejectUnauthorized: true, // ใช้ SSL ตรวจสอบใบรับรอง (ตาม TiDB Cloud)
  },
});

// ตรวจสอบการเชื่อมต่อ
const checkConnection = async () => {
  try {
    const [rows] = await pool.query('SELECT 1');
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
};

// ทดสอบการเชื่อมต่อกับฐานข้อมูลเมื่อเริ่มต้น
checkConnection();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const query = `
        SELECT 
          course1.id_macou,
          course1.code_cou,
          course1.name_cou,
          course1.category,
          exteagency1.name_extage,
          exteagency1.subname_extage
        FROM 
          course1
        JOIN 
          exteagency1
        ON 
          course1.id_extage = exteagency1.id_extage
      `;

      const [rows] = await pool.query(query);

      res.status(200).json({ courses: rows });
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
