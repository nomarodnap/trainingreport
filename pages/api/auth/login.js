// /api/auth/login-by-thaid.js
import * as Sentry from '@sentry/nextjs';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import pool from '../../../lib/db';
import { checkDpisAuth, requestDpisToken, upsertDpisUser } from '../../../lib/dpisAuth';
import {
  attachSessionUserContext,
  sanitizeErrorForLog,
  withBusinessSpan,
} from '../../../lib/sentry';

// Config (เปลี่ยนให้ตรงกับระบบคุณ)
const THAID = {
  client_id: process.env.THAID_CLIENT_ID,
  client_secret: process.env.THAID_CLIENT_SECRET,
  redirect_uri: process.env.THAID_REDIRECT_URI,
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
  return withBusinessSpan(
    'auth.load_encrypted_password',
    'db.users',
    { 'auth.provider': 'thaid' },
    async (span) => {
      const [rows] = await pool.execute('SELECT password FROM users WHERE username = ?', [username]);
      span.setAttribute('users.found', rows.length > 0);
      if (!rows.length) {
        throw new Error('ไม่พบผู้ใช้ในฐานข้อมูล ในการ login ครั้งแรก คุณจำเป็นต้องเข้าระบบด้วยวิธี DPIS ก่อน');
      }
      return decryptPassword(rows[0].password);
    }
  );
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

  const startedAt = Date.now();

  try {
    // 1. ขอ Token จาก ThaID
    const pid = await withBusinessSpan(
      'auth.thaid_exchange_token',
      'http.client.thaid',
      { 'auth.provider': 'thaid' },
      async (span) => {
        const stepStartedAt = Date.now();
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', THAID.redirect_uri);
        params.append('client_id', THAID.client_id);
        params.append('client_secret', THAID.client_secret);

        const thaidResponse = await axios.post('https://imauth.bora.dopa.go.th/api/v2/oauth2/token/', params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const stepDurationMs = Date.now() - stepStartedAt;
        span.setAttributes({
          'thaid.http_status': thaidResponse.status,
          'thaid.duration_ms': stepDurationMs,
        });

        if (stepDurationMs >= 3000) {
          Sentry.logger.warn('ThaID OAuth token endpoint responded slowly', {
            auth_provider: 'thaid',
            http_status: thaidResponse.status,
            duration_ms: stepDurationMs,
          });
        }

        const tokenData = thaidResponse.data;
        const decoded = jwt.decode(tokenData.id_token);
        const decodedPid = decoded?.pid;
        span.setAttribute('auth.has_pid', Boolean(decodedPid));

        if (!decodedPid) throw new Error('ไม่พบ pid ใน id_token');
        return decodedPid;
      }
    );

    attachSessionUserContext(req, { username: pid });

    // 2. ดึง password ที่เข้ารหัสจากฐานข้อมูล
    const password = await getPasswordFromDB(pid);

    // 3. ขอ token จาก DPIS
    const tokenData = await requestDpisToken('thaid');
    if (!tokenData?.accessToken) {
      throw new Error('Failed to get DPIS API token');
    }

    // 4. Login เข้า DPIS
    const authResult = await checkDpisAuth(pid, password, tokenData.accessToken, 'thaid');
    if (authResult.parseError) {
      throw authResult.parseError;
    }
    const userData = authResult.userData;
    if (!userData?.per_cardno) {
      throw new Error('DPIS login ไม่ผ่าน อาจเป็นเพราะมาจากระบบ DPIS ล่ม หรือไม่ก็คุณได้เปลี่ยนรหัส DPIS ให้ลองเข้าระบบด้วยวิธี DPIS');
    }

    // 5. บันทึก/อัปเดตข้อมูล user ลง DB
    const status = await upsertDpisUser(uuidv4(), userData, encryptPassword(password), 'thaid');

    attachSessionUserContext(req, {
      username: pid,
      status,
      department: userData.org_name,
      group_name: userData.org_name1,
      type: userData.pertype_name,
    });

    // 6. สร้าง cookie session
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

    Sentry.logger.info('ThaID login succeeded', {
      auth_provider: 'thaid',
      dpis_http_status: authResult.httpStatus,
      user_role: status || 'unknown',
      duration_ms: Date.now() - startedAt,
      status: 'success',
      http_status: 302,
    });

    res.setHeader('Set-Cookie', userCookie);
    res.redirect('/');

  } catch (err) {
    const safeErr = sanitizeErrorForLog(err);
    Sentry.logger.error('ThaID login failed', {
      auth_provider: 'thaid',
      duration_ms: Date.now() - startedAt,
      status: 'error',
      http_status: 500,
      ...safeErr,
    });
    Sentry.captureException(err);
    console.error('❌ Login by ThaID error:', safeErr.error_message);
    res.status(500).json({ message: 'Login failed', error: safeErr.error_message });
  }
}
