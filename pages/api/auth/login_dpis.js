import * as Sentry from "@sentry/nextjs";
import { serialize } from "cookie";
import { v4 as uuidv4 } from 'uuid';
import crypto from "crypto";
import { checkDpisAuth, requestDpisToken, upsertDpisUser } from "../../../lib/dpisAuth";
import { attachSessionUserContext, sanitizeErrorForLog } from "../../../lib/sentry";


const ENCRYPTION_KEY = crypto.createHash("sha256").update(String(process.env.ENCRYPTION_SECRET)).digest("base64").substring(0, 32); // 32 bytes key
const IV_LENGTH = 16; // AES ใช้ IV 16 bytes

function encryptPassword(password) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
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

  const startedAt = Date.now();
  attachSessionUserContext(req, { username });

  try {
    // ✅ ดึง Token จาก API
    let tokenData;
    try {
      tokenData = await requestDpisToken("dpis");
    } catch {
      return res.status(500).json({ message: "เครือข่ายของระบบ DPIS มีปัญหา โปรดลองเข้าใหม่ในภายหลัง" });
    }

    if (!tokenData || !tokenData.accessToken) {
      Sentry.logger.warn("DPIS token missing in response", {
        auth_provider: "dpis",
        duration_ms: Date.now() - startedAt,
        status: "missing_token",
        http_status: 500,
      });
      return res.status(500).json({ message: "Failed to get API token." });
    }

    // ✅ เรียก API เพื่อล็อกอิน
    const authResult = await checkDpisAuth(username, password, tokenData.accessToken, "dpis");

    // ✅ เช็คโครงสร้างข้อมูล
    if (!authResult.hasPayload) {
      Sentry.logger.warn("DPIS login failed: invalid credentials", {
        auth_provider: "dpis",
        dpis_http_status: authResult.httpStatus,
        duration_ms: Date.now() - startedAt,
        status: "unauthorized",
        http_status: 401,
      });
      return res.status(401).json({ message: "Invalid login credentials" });
    }

    if (authResult.parseError || !authResult.userData) {
      const safeParseErr = sanitizeErrorForLog(authResult.parseError);
      Sentry.logger.error("DPIS authcheck response parse failed", {
        auth_provider: "dpis",
        dpis_http_status: authResult.httpStatus,
        duration_ms: Date.now() - startedAt,
        status: "invalid_response",
        ...safeParseErr,
      });
      return res.status(500).json({ message: "Invalid API response format" });
    }

    const userData = authResult.userData;

    if (!userData.per_cardno) {
      Sentry.logger.warn("DPIS login rejected: invalid card number or password", {
        auth_provider: "dpis",
        dpis_http_status: authResult.httpStatus,
        duration_ms: Date.now() - startedAt,
        status: "rejected",
        http_status: 400,
      });
      return res.status(400).json({ message: "คุณใส่เลขบัตรประชาชน หรือรหัสผ่านผิด" });
    }

    const userId = uuidv4();
    const encryptedPassword = encryptPassword(password);
    const status = await upsertDpisUser(userId, userData, encryptedPassword, "dpis");

    attachSessionUserContext(req, {
      username: userData.per_cardno,
      status,
      department: userData.org_name,
      group_name: userData.org_name1,
      type: userData.pertype_name,
    });

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

    Sentry.logger.info("DPIS login succeeded", {
      auth_provider: "dpis",
      dpis_http_status: authResult.httpStatus,
      user_role: status || "unknown",
      duration_ms: Date.now() - startedAt,
      status: "success",
      http_status: 200,
    });

    return res.status(200).json({ message: "Login successful", user: userData });

  } catch (error) {
    const safeErr = sanitizeErrorForLog(error);
    Sentry.logger.error("DPIS login unexpected error", {
      auth_provider: "dpis",
      duration_ms: Date.now() - startedAt,
      status: "error",
      http_status: 500,
      ...safeErr,
    });
    Sentry.captureException(error);
    console.error("Login Error:", safeErr.error_message);
    return res.status(500).json({
      message:
        "เครือข่ายของระบบ DPIS มีปัญหา โปรดลองเข้าใหม่ในภายหลัง"
    });

  }
}
