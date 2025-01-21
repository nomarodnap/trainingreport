import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query(`
        SELECT id, username, courseCode, trainingOrg, category, trainingMethod, startDate, endDate, totalCost
        FROM training_reports
      `);
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching reports' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}


