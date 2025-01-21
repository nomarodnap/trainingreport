import pool from '../../lib/db'; // ใช้ pool ตามที่ได้ import มา
import bcrypt from 'bcrypt'; // นำเข้า bcrypt

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { currentPassword, username } = req.body;

    // Debug: แสดงค่าของ username และ currentPassword ที่รับมา
    console.log('Received username:', username);
    console.log('Received currentPassword:', currentPassword);

    try {
      // ตรวจสอบว่าได้รับค่าที่จำเป็น
      if (!username || !currentPassword) {
        return res.status(400).json({ message: 'กรุณาระบุข้อมูลที่จำเป็น' });
      }

      // ใช้ async/await เพื่อทำงานกับ query
      const [result] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

      // Debug: แสดงผลลัพธ์จากการค้นหาผู้ใช้ในฐานข้อมูล
      console.log('Query result:', result);

      if (result.length === 0) {
        return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
      }

      const user = result[0]; // เข้าถึงข้อมูลผู้ใช้จากผลลัพธ์ที่ได้จากฐานข้อมูล

      // Debug: แสดงค่าของ currentPassword และ user.password ก่อนทำการเปรียบเทียบ
      console.log('Current password:', currentPassword);
      console.log('Stored user password (hashed):', user.password);

      // เปรียบเทียบรหัสผ่าน
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      // Debug: แสดงผลการเปรียบเทียบรหัสผ่าน
      console.log('Password match result:', isMatch);

      if (isMatch) {
        return res.status(200).json({ isValid: true });
      } else {
        return res.status(400).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
