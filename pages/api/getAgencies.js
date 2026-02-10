import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT id_extage, subname_extage, name_extage FROM exteagency1');
      res.status(200).json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database query failed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
