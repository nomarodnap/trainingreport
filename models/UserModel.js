import pool from '../lib/db'; // เชื่อมต่อกับฐานข้อมูลจริง
import bcrypt from 'bcryptjs';

// 📘 ฟังก์ชันค้นหาผู้ใช้โดยใช้ username
export const findUserByUsername = async (username) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    throw new Error('เกิดข้อผิดพลาดในการค้นหาผู้ใช้');
  }
};

// 📘 ฟังก์ชันค้นหาผู้ใช้โดยใช้ email
export const findUserByEmail = async (email) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    throw new Error('เกิดข้อผิดพลาดในการค้นหาผู้ใช้');
  }
};

// 📘 ฟังก์ชันสร้างผู้ใช้ใหม่
export const createUser = async ({
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
}) => {
  try {
    // เข้ารหัส (hash) รหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // บันทึกข้อมูลผู้ใช้ใหม่ลงฐานข้อมูล
    const result = await pool.query(
      'INSERT INTO users (username, email, password, first_name, last_name, phone_number, position, level, department, group_name, under_department1, under_department2, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [
        username,
        email,
        hashedPassword,
        firstName,
        lastName,
        phone || null, // บันทึกเบอร์โทรศัพท์
        position,
        level || null,
        department || null,
        group || null,
        underDepartment1 || null,
        underDepartment2 || null,
      ]
    );

    return result[0]; // คืนค่าผู้ใช้ที่ถูกสร้างขึ้น
  } catch (error) {
    throw new Error('เกิดข้อผิดพลาดในการสมัครสมาชิก');
  }
};
