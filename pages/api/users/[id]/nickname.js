// /pages/api/users/[id]/nickname.js
import db from '../../../../lib/db'; // เปลี่ยนตามที่คุณใช้จริง

export default async function handler(req, res) {
  const {
    query: { id },
    method,
    body: { nickname },
  } = req;

  if (method === 'PUT') {
    try {
      await db.query('UPDATE users SET nickname = ? WHERE id = ?', [nickname, id]);
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Database error', details: err.message });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
