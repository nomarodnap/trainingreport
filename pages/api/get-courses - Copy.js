import mysql from 'mysql2/promise';
import dbConfig from '../../lib/db.js'; 


export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const connection = await mysql.createConnection(dbConfig);

      const query = `
        SELECT 
          c.id_macou AS id_course,
          c.code_cou AS course_code,
          c.name_cou AS course_name,
          c.category AS category,
          e.name_extage AS agency_name,
          e.subname_extage AS agency_subname
        FROM 
          course1 c
        JOIN 
          exteagency1 e
        ON 
          c.id_extage = e.id_extage
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
