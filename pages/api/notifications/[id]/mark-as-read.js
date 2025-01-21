import pool from '../../../../lib/db.js'; // นำเข้า pool จาก db.js

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { id } = req.query;

    try {
      // อัปเดตการแจ้งเตือนในฐานข้อมูล
      const [result] = await pool.promise().query(
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
