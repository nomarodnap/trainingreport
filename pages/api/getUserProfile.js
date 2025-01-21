import db from "../../lib/db"; // สมมติว่ามีการตั้งค่า connection ฐานข้อมูล

export default async function handler(req, res) {
  // ตรวจสอบว่าเป็น GET Request
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // ดึง username จาก query string
  const { username } = req.query;

  // ตรวจสอบว่า username ถูกส่งมา
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    // ค้นหาผู้ใช้ในฐานข้อมูล
    db.query(
      'SELECT * FROM users WHERE username = ?',
      [username],
      (err, results) => {
        if (err) {
          console.error('Error querying database:', err.stack);
          return res.status(500).json({ message: "Internal Server Error" });
        }

        // ตรวจสอบหากไม่พบผู้ใช้
        if (results.length === 0) {
          return res.status(404).json({ message: "User not found" });
        }

        // ดึงข้อมูลผู้ใช้จากผลลัพธ์
        const user = results[0];

        // ส่งข้อมูลผู้ใช้กลับ
        return res.status(200).json({
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone_number: user.phone_number,
          position: user.position,
          level: user.level,
          department: user.department,
          group_name: user.group_name,
          under_department1: user.under_department1,
          under_department2: user.under_department2,
          status: user.status,
        });
      }
    );
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
