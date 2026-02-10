import pool from '../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    try {
        // Query ดึงข้อมูลจากตาราง users รวมถึง nickname
        const [rows] = await pool.query(
            `SELECT 
                id,
                title,
                first_name, 
                last_name, 
                phone_number,
                position, 
                level, 
                department, 
                group_name, 
                under_department1, 
                under_department2, 
                type,
                status,
                username,
                email,
                password,
                nickname  -- ✅ เพิ่มคอลัมน์ nickname ตรงนี้
            FROM users 
            WHERE username = ?`,
            [username]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching user data:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
