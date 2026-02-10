// pages/api/show-password.js
import db from "@/lib/db"; // ปรับ path ให้ตรงกับโปรเจกต์คุณ
import crypto from "crypto";

const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update("mySecretKey123")
  .digest("base64")
  .substring(0, 32); // ต้องเหมือนกับตอนเข้ารหัส
const IV_LENGTH = 16;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: "กรุณากรอก username" });
  }

  try {
    // ดึง password ที่เข้ารหัสไว้
    const [rows] = await db.execute(
      "SELECT password FROM users WHERE username = ? LIMIT 1",
      [username]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้นี้" });
    }

    const encrypted = rows[0].password;
    const [ivHex, encryptedHex] = encrypted.split(":");

    const iv = Buffer.from(ivHex, "hex");
    const encryptedText = Buffer.from(encryptedHex, "hex");

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    const plainPassword = decrypted.toString("utf8");

    return res.status(200).json({ password: plainPassword });
  } catch (err) {
    console.error("Decrypt error:", err);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์", error: err.message });
  }
}
