import pool from '../lib/db';
import bcrypt from 'bcrypt';
import { createUser } from '../models/UserModel';

// ฟังก์ชันสำหรับเข้าสู่ระบบ
export const handleSignin = async (usernameOrEmail, password) => {
  try {
    // ค้นหาผู้ใช้ในฐานข้อมูลจาก username หรือ email
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [usernameOrEmail, usernameOrEmail] // ค้นหาได้ทั้ง username และ email
    );

    if (rows.length === 0) {
      throw new Error('ไม่พบผู้ใช้');
    }

    const user = rows[0];

    // ตรวจสอบรหัสผ่านที่ผู้ใช้ป้อน
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('รหัสผ่านไม่ถูกต้อง');
    }

    // ส่งข้อมูลผู้ใช้กลับไป รวมถึงสถานะ
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status, // เพิ่มสถานะ
    };
  } catch (error) {
    console.error('ข้อผิดพลาดใน handleSignin:', error);
    throw new Error('เกิดข้อผิดพลาดในระบบ');
  }
};


// ฟังก์ชันสำหรับสมัครสมาชิก
export const handleSignup = async (userData) => {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!userData.username || !userData.email || !userData.password || !userData.phone) {
      throw new Error('ข้อมูลไม่ครบ กรุณากรอกข้อมูลให้ครบถ้วน');
    }

    // ตรวจสอบว่ามีผู้ใช้ซ้ำในฐานข้อมูล (username หรือ email)
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

    // สร้างผู้ใช้ใหม่ในฐานข้อมูล
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, first_name, last_name, phone_number, position, level, department, group_name, under_department1, under_department2, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [
        userData.username,
        userData.email,
        userData.password,
        userData.firstName,
        userData.lastName,
        userData.phone, // บันทึกเบอร์โทรศัพท์
        userData.position,
        userData.level || null,
        userData.department || null,
        userData.group || null,
        userData.underDepartment1 || null,
        userData.underDepartment2 || null,
      ]
    );

    // ส่งข้อมูลผู้ใช้ที่เพิ่งสร้างกลับไป
    return { id: result.insertId, username: userData.username, email: userData.email, phone: userData.phone };
  } catch (error) {
    console.error('ข้อผิดพลาดใน handleSignup:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('ชื่อผู้ใช้หรืออีเมลถูกใช้ไปแล้ว');
    }
    throw new Error('เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์');
  }
};

