import mysql from 'mysql2/promise';
import dbConfig from '../../lib/db.js'; 



export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const connection = await mysql.createConnection(dbConfig);

      const query = `
        SELECT 
          course1.id_macou,
          course1.code_cou,
          course1.name_cou,
          course1.category,
          exteagency1.name_extage,
          exteagency1.subname_extage
        FROM 
          course1
        JOIN 
          exteagency1
        ON 
          course1.id_extage = exteagency1.id_extage
      `;

      const [rows] = await connection.execute(query);
      connection.end();

      res.status(200).json({ courses: rows });
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
