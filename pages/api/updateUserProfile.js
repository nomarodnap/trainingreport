// pages/api/updateUserProfile.js
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import db from '../../lib/db';




export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { username, currentPassword, newPassword, email, firstName, lastName, phone, position, level, department, group, underDepartment1, underDepartment2 } = req.body;

    if (!username || !currentPassword || !email || !firstName || !lastName || !position) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    try {
      // ตรวจสอบรหัสผ่านปัจจุบัน
      const [user] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

      if (user.length === 0) {
        return res.status(404).json({ message: 'ไม่พบผู้ใช้นี้' });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user[0].password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
      }

      // ถ้ามีการเปลี่ยนรหัสผ่านใหม่ ให้ทำการแปลงรหัสผ่านใหม่
      let updatedPassword = user[0].password;
      if (newPassword) {
        const salt = await bcrypt.genSalt(10);
        updatedPassword = await bcrypt.hash(newPassword, salt);
      }

      // อัปเดตข้อมูลในฐานข้อมูล
      const [result] = await db.execute(
        'UPDATE users SET email = ?, first_name = ?, last_name = ?, phone_number = ?, position = ?, level = ?, department = ?, group_name = ?, under_department1 = ?, under_department2 = ?, password = ? WHERE username = ?',
        [
          email,
          firstName,
          lastName,
          phone,
          position,
          level,
          department,
          group,
          underDepartment1,
          underDepartment2,
          updatedPassword,
          username,
        ]
      );

      return res.status(200).json({ message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
