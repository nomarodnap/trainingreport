// db.js (ไฟล์ที่ใช้เชื่อมต่อฐานข้อมูล)
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10, // กำหนดจำนวนการเชื่อมต่อพร้อมกัน
  queueLimit: 0 // จำกัดจำนวนคำขอในคิว
});

// ฟังก์ชันดึงข้อมูลผู้ใช้ตาม ID
export async function getUserById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0]; // ส่งข้อมูลผู้ใช้กลับ
}

// ฟังก์ชันดึงรายงานการอบรมของผู้ใช้
export async function getTrainingReportsByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM training_reports WHERE username = ?', [username]);
    return rows; // ส่งข้อมูลรายงานการอบรมกลับ
}

export default {
    getUserById,
    getTrainingReportsByUsername,
};
