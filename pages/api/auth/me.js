// /pages/api/auth/me.js
export default function handler(req, res) {
  const cookie = req.headers.cookie || '';
  const userCookie = cookie.split(';').find(c => c.trim().startsWith('user='));

  if (!userCookie) {
    return res.status(401).json({ error: 'No user session' });
  }

  try {
    const user = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: 'Invalid session data' });
  }
}
