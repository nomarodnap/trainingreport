import * as Sentry from '@sentry/nextjs';
import pool from '../../lib/db';
import {
    attachSessionUserContext,
    sanitizeErrorForLog,
    withBusinessSpan,
} from '../../lib/sentry';

export default async function handler(req, res) {
    attachSessionUserContext(req);

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const startedAt = Date.now();

    try {
        const userRow = await withBusinessSpan(
            'users.fetch_by_username',
            'db.users',
            { 'users.has_username_param': true },
            async (span) => {
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

                const found = rows.length > 0;
                span.setAttribute('users.found', found);
                if (found) {
                    const row = rows[0];
                    if (row.status) span.setAttribute('user.role', row.status);
                    if (row.department) span.setAttribute('user.department', row.department);
                }

                return found ? rows[0] : null;
            }
        );

        if (!userRow) {
            return res.status(404).json({ error: 'User not found' });
        }

        attachSessionUserContext(req, {
            id: userRow.id,
            username: userRow.username,
            status: userRow.status,
            department: userRow.department,
            group_name: userRow.group_name,
            type: userRow.type,
        });

        return res.status(200).json(userRow);
    } catch (error) {
        const safeErr = sanitizeErrorForLog(error);
        Sentry.logger.error('Error fetching user data', {
            duration_ms: Date.now() - startedAt,
            status: 'error',
            ...safeErr,
        });
        Sentry.captureException(error);
        console.error('Error fetching user data:', safeErr.error_message);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
