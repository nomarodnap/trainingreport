import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10, // กำหนดจำนวนการเชื่อมต่อพร้อมกัน
  queueLimit: 0 // จำกัดจำนวนคำขอในคิว
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { username } = req.body;

    try {
        console.log('🔍 Executing SQL Query with username:', username);

        // ใช้ connection pool ในตัว
const [result] = await pool.execute(`
  SELECT status, email, title, first_name, last_name
  FROM users
  WHERE username = ?
`, [username]);

        console.log('🟢 SQL Query Result:', result);

        if (result.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

return res.status(200).json({
  status: result[0].status,
  email: result[0].email,
  title: result[0].title,
  first_name: result[0].first_name,
  last_name: result[0].last_name,
});
    } catch (error) {
        console.error('❌ Database error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
