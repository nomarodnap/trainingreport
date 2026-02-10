import mysql from "mysql2/promise";
import axios from "axios";
import { serialize } from "cookie";
import { v4 as uuidv4 } from 'uuid';
import crypto from "crypto";


const ENCRYPTION_KEY = crypto.createHash("sha256").update(String(process.env.ENCRYPTION_SECRET)).digest("base64").substring(0, 32); // 32 bytes key
const IV_LENGTH = 16; // AES ใช้ IV 16 bytes

function encryptPassword(password) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}


const DOMAIN_SERVER = process.env.DPIS_DOMAIN;
const USER_API = process.env.DPIS_API_USER;
const PASSWORD_API = process.env.DPIS_API_PASS;


async function getStatusFromDB(username) {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [rows] = await db.execute("SELECT status FROM users WHERE username = ?", [username]);
  await db.end();

  return rows.length > 0 ? rows[0].status : null;
}

// 🔥 ฟังก์ชันดึง Token จาก API
async function getToken() {
  try {
    const response = await axios.post(`${DOMAIN_SERVER}oapi/login`, {
      username: USER_API,
      password: PASSWORD_API,
    });

    return response.data; // ✅ response.data.accessToken อยู่ในนี้
  } catch (error) {
    console.error("Error fetching token:", error);
    throw new Error("Failed to get API token");
  }
}

// 🔥 ฟังก์ชันหลัก
export default async function handler(req, res) {
  // ✅ Prevent Caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Both username and password are required." });
  }

  try {
    // ✅ ดึง Token จาก API
    const tokenData = await getToken();
    if (!tokenData || !tokenData.accessToken) {
      return res.status(500).json({ message: "Failed to get API token." });
    }

    // ✅ เรียก API เพื่อล็อกอิน
    const apiResponse = await axios.post(
      `${DOMAIN_SERVER}api/authuser/authcheck`,
      new URLSearchParams({
        authen_user: username,
        authen_password: password,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: tokenData.accessToken, // ✅ ใช้ token แบบเดิม
        },
      }
    );

    console.log("Raw API Response:", apiResponse.data);

    // ✅ เช็คโครงสร้างข้อมูล
    if (!apiResponse.data?.data) {
      return res.status(401).json({ message: "Invalid login credentials" });
    }

    // ✅ แปลง JSON (หากจำเป็น)
    let userData;
    try {
      userData = typeof apiResponse.data.data === "string"
        ? JSON.parse(apiResponse.data.data)
        : apiResponse.data.data;
    } catch (error) {
      console.error("JSON Parse Error:", error);
      return res.status(500).json({ message: "Invalid API response format" });
    }

    if (!userData.per_cardno) {
      return res.status(400).json({ message: "คุณใส่เลขบัตรประชาชน หรือรหัสผ่านผิด" });
    }

    // ✅ เชื่อมต่อ MySQL
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });


    const userId = uuidv4();

    // ✅ INSERT หรือ UPDATE ข้อมูลผู้ใช้
    const encryptedPassword = encryptPassword(password); // ← new line

    await db.execute(
      `INSERT INTO users (id, username, title, first_name, last_name, type, position, level, department, group_name, under_department1, password, last_login)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
   ON DUPLICATE KEY UPDATE 
     title = VALUES(title),
     first_name = VALUES(first_name),
     last_name = VALUES(last_name),
     type = VALUES(type),
     position = VALUES(position),
     level = VALUES(level),
     department = VALUES(department),
     group_name = VALUES(group_name),
     under_department1 = VALUES(under_department1),
     password = VALUES(password),
     updated_at = CURRENT_TIMESTAMP,
     last_login = CURRENT_TIMESTAMP`,
      [
        userId,
        userData.per_cardno,
        userData.pn_name,
        userData.per_name,
        userData.per_surname,
        userData.pertype_name,
        userData.pl_name,
        userData.per_level_name,
        userData.org_name,
        userData.org_name1,
        userData.org_name2,
        encryptedPassword  // ← new
      ]
    );


    await db.end();

    // ✅ ตั้งค่า Cookie
    const status = await getStatusFromDB(userData.per_cardno);

    res.setHeader("Set-Cookie",
      serialize("session", JSON.stringify({
        username: userData.per_cardno,
        status,
        name: `${userData.pn_name}${userData.per_name} ${userData.per_surname}`,
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // ✅ ใช้ secure เฉพาะ prod
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 8, // ✅ 15 นาที
      })
    );






    return res.status(200).json({ message: "Login successful", user: userData });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message:
        "เครือข่ายของระบบ DPIS มีปัญหา โปรดลองเข้าใหม่ในภายหลัง"
    });

  }
}
