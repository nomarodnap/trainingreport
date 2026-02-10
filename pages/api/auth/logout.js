// pages/api/auth/logout.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // เคลียร์ cookie (เช่น ชื่อ 'token' หรือ 'session')
  res.setHeader('Set-Cookie', [
    'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax',
  ]);

  res.status(200).json({ message: 'Logged out successfully' });
}
