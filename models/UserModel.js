import pool from '../lib/db'; // MySQL connection
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const findUserByUsername = async (username) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw new Error('เกิดข้อผิดพลาดในการค้นหาผู้ใช้');
  }
};

export const findUserByEmail = async (email) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw new Error('เกิดข้อผิดพลาดในการค้นหาผู้ใช้');
  }
};

export const createUser = async ({
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
}) => {
  try {
    const id = uuidv4(); // ✅ สร้าง UUID
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (
        id, username, email, password,
        first_name, last_name, phone_number,
        position, level, department, group_name,
        under_department1, under_department2, created_at
      ) VALUES (
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, NOW()
      )
    `;

    const values = [
      id,
      username,
      email,
      hashedPassword,
      firstName,
      lastName,
      phone || null,
      position,
      level || null,
      department || null,
      group || null,
      underDepartment1 || null,
      underDepartment2 || null,
    ];

    await pool.query(query, values);
    return { id, username, email };
  } catch (error) {
    console.error(error);
    throw new Error('เกิดข้อผิดพลาดในการสมัครสมาชิก');
  }
};
