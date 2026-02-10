import { getSession } from 'next-auth/react';
import db from '../../../lib/db'; // เชื่อมต่อฐานข้อมูล

export default async function handler(req, res) {
    const session = await getSession({ req });

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Query ข้อมูลผู้ใช้จากฐานข้อมูล
        const user = await db.query(`
            SELECT id, first_name, last_name, email, department
            FROM users
            WHERE email = ?
        `, [session.user.email]);

        if (!user.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user[0]);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
