import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'ไม่รองรับวิธีการที่ร้องขอ' });
  }

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: 'รหัสยืนยันไม่ถูกต้อง' });
  }

  try {
    // ตรวจสอบรหัสยืนยันในฐานข้อมูล
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE verification_code = ?',
      [code]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'รหัสยืนยันไม่ถูกต้อง หรือรหัสหมดอายุแล้ว' });
    }

    const user = rows[0];

    if (user.email_verified) {
      return res.status(400).json({ message: 'อีเมลนี้ได้รับการยืนยันแล้ว' });
    }

    // อัปเดตสถานะการยืนยัน
    await pool.query(
      'UPDATE users SET email_verified = 1, verification_code = NULL WHERE id = ?',
      [user.id]
    );

    res.status(200).json({ message: 'ยืนยันอีเมลสำเร็จ!' });
  } catch (err) {
    console.error('เกิดข้อผิดพลาด:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
}
