// pages/api/signin.js
import { handleSignin } from '../../controllers/AuthController';
import { serialize } from 'cookie'; // ใช้สำหรับการตั้งค่า cookie

export default async function handler(req, res) {

  // ✅ 1. กำหนด Headers สำหรับ CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); // อนุญาตทุกโดเมน
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // อนุญาตเฉพาะ POST และ OPTIONS
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // อนุญาต Header ที่จำเป็น

  // ✅ Prevent Caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  // ✅ 2. ตรวจสอบว่าเป็น OPTIONS Request หรือไม่ (Preflight Request)
  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // จบการทำงานตรงนี้เลย
  }


  console.log("Method:", req.method); // เช็คว่า method ถูกต้องไหม
  if (req.method === 'POST') {
    const { usernameOrEmail, password } = req.body;

    console.log('Received data:', req.body); // ตรวจสอบข้อมูลที่ได้รับ

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    try {
      const user = await handleSignin(usernameOrEmail, password);



      res.setHeader('Set-Cookie', serialize('session', JSON.stringify(user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 8, // 15 นาที
      }));



      res.status(200).json({
        message: 'เข้าสู่ระบบสำเร็จ',
        user,
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } else {
    console.log("Method Not Allowed"); // Log ถ้าเจอ 405
    res.status(405).json({ message: 'ไม่รองรับวิธีการที่ร้องขอ' });
  }
}
