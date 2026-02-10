import formidable from "formidable";
import path from "path";
import pool from "../../lib/db";

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      uploadDir: 'D:\\uploads',
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { fields, files } = await parseForm(req);

      const { fullname, citizenId, phone, subject, detail } = fields;
      const image = files.image ? path.basename(files.image[0].filepath) : null;

      const [result] = await pool.query(
        `INSERT INTO support_requests (fullname, citizen_id, phone, subject, detail, image_path)
   VALUES (?, ?, ?, ?, ?, ?)`,
        [fullname, citizenId, phone, subject, detail, image]
      );


      // เพิ่มแจ้งเตือนเข้า table notifications (support-list)
      await pool.query(
        `INSERT INTO notifications (support_id, message, isRead, created_at)
         VALUES (?, ?, 0, NOW())`,
        [
          result.insertId,
          `มีคำร้องขอความช่วยเหลือใหม่ #${result.insertId}`
        ]
      );

      res.status(200).json({ success: true, id: result.insertId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else if (req.method === "GET") {
    try {
      const [rows] = await pool.query(
        `SELECT id, fullname, citizen_id, phone, subject, detail, image_path, created_at, is_fixed
         FROM support_requests
         ORDER BY created_at DESC`
      );
      res.status(200).json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Database error" });
    }
  } else if (req.method === "PUT") {
    try {
      const body = await new Promise((resolve, reject) => {
        let data = '';
        req.on("data", chunk => { data += chunk; });
        req.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      });

      const { id, is_fixed } = body;

      await pool.query(
        `UPDATE support_requests SET is_fixed = ? WHERE id = ?`,
        [is_fixed ? 1 : 0, id]
      );

      res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Update error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
