import pool from '../lib/db';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { createUser } from '../models/UserModel';

// สร้าง transporter สำหรับส่งอีเมล
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dofictdev@gmail.com', // ใส่อีเมลของคุณ
    pass: 'kotz tmem gdze kxpg',  // ใส่รหัสผ่านของอีเมล
  },
});

// ฟังก์ชันสำหรับส่งอีเมลยืนยัน
const sendVerificationEmail = async (email, verificationCode) => {
  const mailOptions = {
    from: 'dofictdev@gmail.com',
    to: email,
    subject: 'ยืนยันอีเมลของคุณ',
    text: `คลิกที่ลิงก์เพื่อยืนยันอีเมลของคุณ: 
      http://your-domain.com/verify-email?code=${verificationCode}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('ไม่สามารถส่งอีเมลได้');
  }
};

// ฟังก์ชันสำหรับเข้าสู่ระบบ
export const handleSignin = async (usernameOrEmail, password) => {
  try {
    // ค้นหาผู้ใช้ในฐานข้อมูลจาก username หรือ email
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [usernameOrEmail, usernameOrEmail]
    );

    if (rows.length === 0) {
      throw new Error('ไม่พบผู้ใช้');
    }

    const user = rows[0];

    // ตรวจสอบสถานะ email_verified
    if (!user.email_verified) {
      throw new Error('บัญชีของคุณยังไม่ได้ยืนยันอีเมล');
    }

    // ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('รหัสผ่านไม่ถูกต้อง');
    }

    // ส่งข้อมูลผู้ใช้กลับไป
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
    };
  } catch (error) {
    console.error('ข้อผิดพลาดใน handleSignin:', error);
    throw new Error(error.message);
  }
};

// ฟังก์ชันสำหรับสมัครสมาชิก
export const handleSignup = async (userData) => {
  try {
    if (!userData.username || !userData.email || !userData.password || !userData.phone) {
      throw new Error('ข้อมูลไม่ครบ กรุณากรอกข้อมูลให้ครบถ้วน');
    }

    // ตรวจสอบว่ามีผู้ใช้ซ้ำในฐานข้อมูล
    const [existingUser] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [userData.username, userData.email]
    );
    if (existingUser.length > 0) {
      throw new Error('ชื่อผู้ใช้หรืออีเมลถูกใช้ไปแล้ว');
    }

    // แฮชรหัสผ่าน
    const saltRounds = 10;
    userData.password = await bcrypt.hash(userData.password, saltRounds);

    // บันทึกผู้ใช้
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, first_name, last_name, phone_number, position, level, department, group_name, under_department1, under_department2, created_at, verification_code, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, 0)',
      [
        userData.username,
        userData.email,
        userData.password,
        userData.firstName,
        userData.lastName,
        userData.phone,
        userData.position,
        userData.level || null,
        userData.department || null,
        userData.group || null,
        userData.underDepartment1 || null,
        userData.underDepartment2 || null,
        userData.verificationCode, // บันทึกโค้ดที่ส่งมา
      ]
    );

    // ส่งอีเมลยืนยัน
    await sendVerificationEmail(userData.email, userData.verificationCode);

    return {
      id: result.insertId,
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
    };
  } catch (error) {
    console.error('ข้อผิดพลาดใน handleSignup:', error);
    throw new Error('เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์');
  }
};

