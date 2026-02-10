import mysql from 'mysql2/promise';

// สร้าง pool การเชื่อมต่อกับฐานข้อมูล MySQL
// สร้าง pool การเชื่อมต่อกับฐานข้อมูล MySQL
// ใช้ Singleton Pattern เพื่อป้องกัน Too many connections
let pool;

if (!global.pool) {
  global.pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 120, // เพิ่มเป็น 20 เพื่อรองรับ request ได้มากขึ้น
    queueLimit: 0, // จำกัดจำนวนคำขอในคิว
    enableKeepAlive: true, // เปิด Keep-Alive เพื่อลด overhead การเชื่อมต่อใหม่
    keepAliveInitialDelay: 0,
  });
}

pool = global.pool;

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
// ทดสอบการเชื่อมต่อกับฐานข้อมูลเมื่อเริ่มต้น
// checkConnection(); // Comment out to prevent build hang (Node process not exiting)

export default pool;
