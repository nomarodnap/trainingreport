import mysql from "mysql2/promise";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { code_cou, name_cou, category, id_extage, id_learn } = req.body;

  if (!code_cou || !name_cou || !category || !id_extage || !id_learn) {
    return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
  }

  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "hrd",
    });

    const [result] = await connection.execute(
      "INSERT INTO course1 (code_cou, name_cou, category, id_extage, id_learn) VALUES (?, ?, ?, ?, ?)",
      [code_cou, name_cou, category, id_extage, id_learn]
    );

    await connection.end();
    res.status(200).json({ message: "เพิ่มข้อมูลสำเร็จ", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มข้อมูล" });
  }
}
