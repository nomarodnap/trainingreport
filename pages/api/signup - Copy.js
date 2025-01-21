// /api/signup.js
import pool from '../../lib/db';
import { handleSignup } from '../../controllers/AuthController';

export default async function handler(req, res) {
  // ตรวจสอบว่า HTTP method ต้องเป็น POST เท่านั้น
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'ไม่รองรับวิธีการที่ร้องขอ' });
  }

  // ดึงข้อมูลจาก request body
  const {
    username,
    email,
    password,
    firstName,
    lastName,
    phone, // เพิ่มฟิลด์ phone
    position,
    level,
    department,
    group,
    underDepartment1,
    underDepartment2,
  } = req.body;

  // ตรวจสอบว่าข้อมูลที่จำเป็นต้องไม่ว่างเปล่า
  if (!username || !email || !password || !firstName || !lastName || !phone || !position) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลในช่องที่มีเครื่องหมาย * ให้ครบ' });
  }

  try {
    // เรียกฟังก์ชัน handleSignup เพื่อบันทึกข้อมูลผู้ใช้
    const newUser = await handleSignup({
      username,
      email,
      password,
      firstName,
      lastName,
      phone, // ส่ง phone ไปยัง handleSignup
      position,
      level,
      department,
      group,
      underDepartment1,
      underDepartment2,
    });

    // ส่งข้อมูลตอบกลับเมื่อสมัครสมาชิกสำเร็จ
    res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จ!',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone, // ส่ง phone กลับใน response
        position: newUser.position,
      },
    });
  } catch (err) {
    console.error('เกิดข้อผิดพลาด:', err);
    if (err.message.includes('ข้อมูลไม่ครบ')) {
      res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน', error: err.message });
    } else if (err.message.includes('ผู้ใช้งานนี้มีอยู่แล้ว')) {
      res.status(409).json({ message: 'ชื่อผู้ใช้งานนี้มีอยู่แล้ว', error: err.message });
    } else if (err.message.includes('ฐานข้อมูลไม่สามารถเชื่อมต่อได้')) {
      res.status(500).json({ message: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้', error: err.message });
    } else {
      res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์', error: err.message });
    }
  }
}
