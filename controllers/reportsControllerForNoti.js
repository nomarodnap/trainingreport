// controllers/reportsController.js
import pool from '../lib/db.js';

const getReport = async (req, res, id) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                tr.*, 
                u.id AS user_id,
                CONCAT(u.first_name, ' ', u.last_name) AS full_name,  // รวมชื่อและนามสกุล
                u.username,
                u.email,
                u.phone_number,
                u.position,
                u.level,
                u.department,
                u.group_name,
                u.under_department1,
                u.under_department2,
                u.created_at,
                u.status
            FROM 
                training_reports tr
            JOIN 
                users u
            ON 
                tr.username = u.username
            WHERE 
                tr.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ message: 'Error fetching report' });
    }
};

const markAsRead = async (req, res, id) => {
    try {
        const result = await pool.query(
            'UPDATE training_reports SET isRead = ? WHERE id = ?',
            [true, id]
        );
        if (result[0].affectedRows === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.status(200).json({ message: 'Report marked as read successfully' });
    } catch (error) {
        console.error('Error marking report as read:', error);
        res.status(500).json({ message: 'Error marking report as read' });
    }
};

export default {
    getReport,
    markAsRead,
};
