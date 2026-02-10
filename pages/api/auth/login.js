// /api/auth/login-by-thaid.js
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Config (เปลี่ยนให้ตรงกับระบบคุณ)
const THAID = {
  client_id: process.env.THAID_CLIENT_ID,
  client_secret: process.env.THAID_CLIENT_SECRET,
  redirect_uri: process.env.THAID_REDIRECT_URI,
};

const DPIS = {
  domain: process.env.DPIS_DOMAIN,
  api_user: process.env.DPIS_API_USER,
  api_pass: process.env.DPIS_API_PASS,
};

const ENCRYPTION_KEY = crypto.createHash("sha256").update(process.env.ENCRYPTION_SECRET).digest("base64").substring(0, 32);
const IV_LENGTH = 16;

function decryptPassword(encrypted) {
  const [ivHex, encryptedHex] = encrypted.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}

function encryptPassword(password) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

async function getPasswordFromDB(username) {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

  });

  const [rows] = await db.execute("SELECT password FROM users WHERE username = ?", [username]);
  await db.end();

  if (!rows.length) throw new Error("ไม่พบผู้ใช้ในฐานข้อมูล ในการ login ครั้งแรก คุณจำเป็นต้องเข้าระบบด้วยวิธี DPIS ก่อน");
  return decryptPassword(rows[0].password);
}

async function getDpisToken() {
  const response = await axios.post(`${DPIS.domain}oapi/login`, {
    username: DPIS.api_user,
    password: DPIS.api_pass,
  });
  return response.data.accessToken;
}

async function loginDpis(username, password, accessToken) {
  const response = await axios.post(
    `${DPIS.domain}api/authuser/authcheck`,
    new URLSearchParams({ authen_user: username, authen_password: password }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: accessToken,
      },
    }
  );

  const data = response.data.data;
  return typeof data === 'string' ? JSON.parse(data) : data;
}

async function upsertUser(userData, password) {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

  });

  const encryptedPassword = encryptPassword(password);
  const userId = uuidv4();

  await db.execute(
    `INSERT INTO users 
      (id, username, title, first_name, last_name, type, position, level, department, group_name, under_department1, password, last_login)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON DUPLICATE KEY UPDATE 
      title=VALUES(title), first_name=VALUES(first_name), last_name=VALUES(last_name),
      type=VALUES(type), position=VALUES(position), level=VALUES(level),
      department=VALUES(department), group_name=VALUES(group_name),
      under_department1=VALUES(under_department1), password=VALUES(password), updated_at=CURRENT_TIMESTAMP, last_login=CURRENT_TIMESTAMP`,
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
      encryptedPassword,
    ]
  );

  await db.end();
}

async function getStatus(username) {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

  });

  const [rows] = await db.execute("SELECT status FROM users WHERE username = ?", [username]);
  await db.end();

  return rows.length ? rows[0].status : null;
}

export default async function handler(req, res) {
  // ✅ Prevent Caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: 'Missing code from ThaID' });
  }

  try {
    // 1. ขอ Token จาก ThaID
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', THAID.redirect_uri);
    params.append('client_id', THAID.client_id);
    params.append('client_secret', THAID.client_secret);

    const thaidResponse = await axios.post('https://imauth.bora.dopa.go.th/api/v2/oauth2/token/', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const tokenData = thaidResponse.data;
    const decoded = jwt.decode(tokenData.id_token);

    const pid = decoded?.pid;
    if (!pid) throw new Error("ไม่พบ pid ใน id_token");

    // 2. ดึง password ที่เข้ารหัสจากฐานข้อมูล
    const password = await getPasswordFromDB(pid);

    // 3. ขอ token จาก DPIS
    const dpisToken = await getDpisToken();

    // 4. Login เข้า DPIS
    const userData = await loginDpis(pid, password, dpisToken);
    if (!userData?.per_cardno) throw new Error("DPIS login ไม่ผ่าน อาจเป็นเพราะมาจากระบบ DPIS ล่ม หรือไม่ก็คุณได้เปลี่ยนรหัส DPIS ให้ลองเข้าระบบด้วยวิธี DPIS");

    // 5. บันทึก/อัปเดตข้อมูล user ลง DB
    await upsertUser(userData, password);

    // 6. สร้าง cookie session
    const status = await getStatus(pid);
    const userCookie = serialize('session', JSON.stringify({
      username: pid,
      status,
      name: `${userData.pn_name}${userData.per_name} ${userData.per_surname}`,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 ชั่วโมง
    });

    res.setHeader('Set-Cookie', userCookie);
    res.redirect('/');

  } catch (err) {
    console.error('❌ Login by ThaID error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
}
