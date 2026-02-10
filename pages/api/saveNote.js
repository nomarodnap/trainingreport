import pool from '../../lib/db'; // ✅ แก้ให้ตรงกับไฟล์ db.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { reportId, note } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE training_reports SET note = ? WHERE id = ?",
      [note, reportId]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "บันทึกโน้ตสำเร็จ" });
    } else {
      res.status(404).json({ message: "ไม่พบรายงานที่ต้องการอัปเดต" });
    }
  } catch (error) {
    console.error("Error saving note:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึกโน้ต" });
  }
}