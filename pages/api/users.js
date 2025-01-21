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
        // Query ดึงข้อมูลจากตาราง users
        const [rows] = await pool.query(
            `SELECT 
		id,
                first_name, 
                last_name, 
		phone_number,
                position, 
                level, 
                department, 
                group_name, 
                under_department1, 
                under_department2, 
		status,
		username,
		email,
		password
            FROM users 
            WHERE username = ?`,
            [username]
        );

        // ตรวจสอบว่าพบผู้ใช้หรือไม่
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // ส่งข้อมูลผู้ใช้กลับไป
        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching user data:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
