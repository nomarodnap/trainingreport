import { createConnection } from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dbConfig from '../../lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'กรุณาระบุ token และรหัสผ่านใหม่' });
    }

    try {
      const connection = await createConnection(dbConfig);

      // ตรวจสอบ token และวันหมดอายุ
      const [users] = await connection.query(
        'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
        [token]
      );

      if (users.length === 0) {
        await connection.end();
        return res.status(400).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
      }

      const user = users[0];

      // เข้ารหัสรหัสผ่านใหม่
      const hashedPassword = await bcrypt.hash(password, 10);

      // อัปเดตรหัสผ่านและล้าง token
      await connection.query(
        'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
        [hashedPassword, user.id]
      );

      await connection.end();
      return res.status(200).json({ message: 'รีเซ็ตรหัสผ่านสำเร็จแล้ว' });
    } catch (error) {
      console.error('Error resetting password:', error);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
