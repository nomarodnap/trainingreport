// pages/api/auth/thaidauth.js
import { serialize } from "cookie";
import jwt_decode from "jwt-decode";

export default async function handler(req, res) {
  const THAID_CLIENT_ID = "NkR0YzJ3d0dYNzlEUWpuYThVZHBSbUlMUEJmMmJieXE";
  const THAID_CLIENT_SECRET = "RUc5OENZMUV3dzNPYW1NdUR3NjgxR1ppNExPQk12cjRNdjhkdm84OA";

  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  try {
    const response = await fetch("https://imauth.bora.dopa.go.th/api/v2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${THAID_CLIENT_ID}:${THAID_CLIENT_SECRET}`).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: "https://trainingreport.fisheries.go.th/api/auth/login",
      }),
    });

    const token = await response.json();

    if (!token.id_token) {
      return res.status(400).json({ error: "ไม่สามารถรับ token ได้" });
    }

    // ถอดรหัส token
    const jwt_decode = require("jwt-decode");
    const userInfo = jwt_decode(token.id_token);

    // สร้าง cookie session
    const { serialize } = require("cookie");
    res.setHeader(
      "Set-Cookie",
      serialize(
        "session",
        JSON.stringify({
          username: userInfo.pid,
          name: userInfo.name,
        }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 8,
        }
      )
    );

    return res.redirect("/");
  } catch (error) {
    console.error("ThaID Auth Error:", error);
    return res.status(500).json({ error: "เกิดข้อผิดพลาดขณะยืนยันตัวตนกับ ThaID" });
  }
}