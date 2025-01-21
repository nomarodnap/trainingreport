import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query(`SELECT id_extage, name_extage FROM exteagency1`);
      res.status(200).json(rows); // ส่งข้อมูลกลับไปยัง client
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving training organizations.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed.' });
  }
}
