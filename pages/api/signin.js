// pages/api/signin.js
import { handleSignin } from '../../controllers/AuthController';
import { serialize } from 'cookie'; // ใช้สำหรับการตั้งค่า cookie

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { usernameOrEmail, password } = req.body;

    try {
      const user = await handleSignin(usernameOrEmail, password);

      // สมมติว่าคุณสร้าง sessionId หลังจากเข้าสู่ระบบสำเร็จ
      const sessionId = 'your-session-id'; // แทนที่ด้วย session ID ที่ได้จากระบบของคุณ

      // ตั้งค่า cookie sessionId
      res.setHeader('Set-Cookie', serialize('sessionId', sessionId, {
        httpOnly: true,   // ไม่สามารถเข้าถึงได้จาก JavaScript
        secure: process.env.NODE_ENV === 'production', // ใช้ใน production เท่านั้น
        sameSite: 'strict', // ป้องกัน CSRF
        path: '/', // ใช้ cookie ทั่วทั้งเว็บไซต์
        maxAge: 60 * 60 * 24 * 7, // ใช้ cookie 7 วัน
      }));

      res.status(200).json({
        message: 'เข้าสู่ระบบสำเร็จ',
        user, // ส่งข้อมูลผู้ใช้พร้อมสถานะ
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } else {
    res.status(405).json({ message: 'ไม่รองรับวิธีการที่ร้องขอ' });
  }
}
