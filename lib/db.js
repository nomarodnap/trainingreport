import mysql from 'mysql2/promise';

// สร้าง pool การเชื่อมต่อกับฐานข้อมูล TiDB Cloud
const pool = mysql.createPool({
  uri: 'mysql://2KZw8WoMHuX93Mg.root:7BOYAE915TxyOYKW@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/hrd?sslMode=VERIFY_IDENTITY', // ใช้ Connection String จาก Environment Variable
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

export default pool;