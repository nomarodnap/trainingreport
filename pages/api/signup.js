import pool from '../../lib/db';
import { handleSignup } from '../../controllers/AuthController';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'ไม่รองรับวิธีการที่ร้องขอ' });
  }

  const {
    username,
    email,
    password,
    firstName,
    lastName,
    phone,
    position,
    level,
    department,
    group,
    underDepartment1,
    underDepartment2,
  } = req.body;

  if (!username || !email || !password || !firstName || !lastName || !phone || !position) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลในช่องที่มีเครื่องหมาย * ให้ครบ' });
  }

  try {
    // สร้างรหัสยืนยัน
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // เรียกใช้ handleSignup เพื่อบันทึกข้อมูล
    const newUser = await handleSignup({
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      position,
      level,
      department,
      group,
      underDepartment1,
      underDepartment2,
      verificationCode, // ส่งรหัสยืนยันไปด้วย
    });

    res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        position: newUser.position,
      },
    });
  } catch (err) {
    console.error('เกิดข้อผิดพลาด:', err);
    if (err.message.includes('ข้อมูลไม่ครบ')) {
      res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน', error: err.message });
    } else if (err.message.includes('ผู้ใช้งานนี้มีอยู่แล้ว')) {
      res.status(409).json({ message: 'ชื่อผู้ใช้งานนี้มีอยู่แล้ว', error: err.message });
    } else {
      res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์', error: err.message });
    }
  }
}
