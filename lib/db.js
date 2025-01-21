import mysql from 'mysql2/promise';

// สร้าง pool การเชื่อมต่อกับฐานข้อมูล MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost', // ใช้ environment variable หรือ localhost
  user: process.env.DB_USER || 'root', // ใช้ environment variable หรือ root
  password: process.env.DB_PASSWORD || '', // ใช้ environment variable หรือค่าว่าง
  database: process.env.DB_NAME || 'hrd', // ใช้ environment variable หรือ hrd
  waitForConnections: true,
  connectionLimit: 10, // กำหนดจำนวนการเชื่อมต่อพร้อมกัน
  queueLimit: 0 // จำกัดจำนวนคำขอในคิว
});

// ตรวจสอบการเชื่อมต่อ
const checkConnection = async () => {
  try {
    const [rows] = await pool.query('SELECT 1');
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};

// ทดสอบการเชื่อมต่อกับฐานข้อมูลเมื่อเริ่มต้น
checkConnection();

export default pool;
