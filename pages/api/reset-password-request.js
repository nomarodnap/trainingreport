import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import pool from '../../lib/db.js';  // นำเข้า pool จาก db.js

// ฟังก์ชันสำหรับ query
async function query(sql, params) {
  const [results] = await pool.execute(sql, params);
  return results;
}

// ฟังก์ชันสำหรับหา user จาก email
async function findUserByEmail(email) {
  const queryText = 'SELECT * FROM users WHERE email = ?';
  const results = await query(queryText, [email]);
  return results[0]; // สมมุติว่าคืนค่าผู้ใช้คนแรก
}

// ฟังก์ชันสำหรับบันทึก reset token
async function saveResetToken(userId, token) {
  const queryText = 'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?';
  const expiryDate = new Date(Date.now() + 3600 * 1000); // 1 ชั่วโมง
  await query(queryText, [token, expiryDate, userId]);
}

// Handler สำหรับ reset password request
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body;

    try {
      // ตรวจสอบว่า email มีอยู่ในระบบหรือไม่
      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'ไม่พบอีเมลนี้ในระบบ' });
      }

      // สร้าง token และบันทึกลงฐานข้อมูล
      const token = uuidv4();
      await saveResetToken(user.id, token);

      // ส่งอีเมลลิงก์สำหรับรีเซ็ตรหัสผ่าน
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'dofictdev@gmail.com',
          pass: 'kotz tmem gdze kxpg',
        },
      });

      const resetLink = `https://trainingreport.vercel.app/reset-password?token=${token}`;
      const mailOptions = {
        from: ระบบรายงานผลการฝึกอบรม,
        to: email,
        subject: 'ลิงก์รีเซ็ตรหัสผ่าน',
        html: `<p>คลิกที่ลิงก์เพื่อรีเซ็ตรหัสผ่านของคุณ: <a href="${resetLink}">${resetLink}</a></p>`,
      };

      await transporter.sendMail(mailOptions);
      return res.status(200).json({ message: 'ลิงก์สำหรับรีเซ็ตรหัสผ่านได้ถูกส่งไปยังอีเมลของคุณ' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดบางอย่าง' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
