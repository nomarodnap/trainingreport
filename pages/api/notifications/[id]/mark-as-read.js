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

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { id } = req.query;

    try {
      // อัปเดตการแจ้งเตือนในฐานข้อมูล
      const [result] = await pool.query(
        "UPDATE training_reports SET isRead = 1 WHERE id = ?", 
        [id]
      );

      if (result.affectedRows > 0) {
        return res.status(200).json({ message: "Notification marked as read" });
      } else {
        return res.status(404).json({ error: "Notification not found" });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    // Method ไม่รองรับ
    return res.status(405).json({ error: "Method not allowed" });
  }
}