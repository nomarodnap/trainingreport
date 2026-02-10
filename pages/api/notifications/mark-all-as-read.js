import mysql from 'mysql2';

export default async function handler(req, res) {
  if (req.method === "POST") {
    const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10, // กำหนดจำนวนการเชื่อมต่อพร้อมกัน
  queueLimit: 0 // จำกัดจำนวนคำขอในคิว
});

    try {
      const [result] = await pool.promise().query(
        "UPDATE training_reports SET isRead = 1 WHERE isRead = 0"
      );

      return res.status(200).json({ message: "All notifications marked as read", affectedRows: result.affectedRows });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      pool.end();
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
