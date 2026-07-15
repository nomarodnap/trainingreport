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
      if (note && note.trim() !== "") {
        const [rows] = await pool.query("SELECT formCode FROM training_reports WHERE id = ?", [reportId]);
        if (rows.length > 0) {
          const formCode = rows[0].formCode;
          await pool.query(
            "INSERT INTO note_notifications (reportId, formCode, note) VALUES (?, ?, ?)",
            [reportId, formCode, note]
          );
        }
      }
      res.status(200).json({ message: "บันทึกโน้ตสำเร็จ" });
    } else {
      res.status(404).json({ message: "ไม่พบรายงานที่ต้องการอัปเดต" });
    }
  } catch (error) {
    console.error("Error saving note:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึกโน้ต" });
  }
}