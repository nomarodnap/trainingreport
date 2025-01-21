import db from "../../lib/db";  // หรือใช้ไฟล์เชื่อมต่อฐานข้อมูลของคุณ

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { id_extage } = req.query;  // รับค่าจาก query string

    if (!id_extage) {
      return res.status(400).json({ error: "Missing id_extage parameter" });
    }

    try {
      // ดึงข้อมูลจากฐานข้อมูลและกรองตาม id_extage
      const [courses] = await db.query(
        "SELECT id_macou, code_cou, name_cou FROM course1 WHERE id_extage = ?",
        [id_extage]  // ส่งค่า id_extage ไปที่ query
      );

      if (courses.length === 0) {
        return res.status(404).json({ message: "No courses found for this agency" });
      }

      res.status(200).json(courses);  // ส่งข้อมูลกลับเป็น JSON
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
