// controllers/reportsController.js
import pool from '../lib/db.js';

const getReports = async (req, res) => {
    try {
        const [rows] = await pool.query(`
    SELECT 
        tr.*, 
        u.id AS user_id,
        u.nickname,
        CONCAT(u.first_name, ' ', u.last_name) AS full_name,
        u.email,
        u.first_name,
        u.last_name,
        u.phone_number,
        u.position,
        u.level,
        u.department,
        u.group_name,
        u.under_department1,
        u.under_department2,
        u.created_at,
        u.status,
        u.type,
        u.title,
        ue.nickname AS whoEdit_nickname
    FROM 
        training_reports tr
    JOIN 
        users u 
      ON tr.username = u.username
    LEFT JOIN 
        users ue
      ON tr.whoEdit = ue.username
`);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Error fetching reports' });
    }
};


const deleteReport = async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ message: 'Missing report ID' });
    }

    try {
        const result = await pool.query('DELETE FROM training_reports WHERE id = ?', [id]);
        if (result[0].affectedRows === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ message: 'Error deleting report' });
    }
};




const markAllAsRead = async (req, res) => {
    try {
        const result = await pool.query('UPDATE training_reports SET isRead = ?', [true]);
        res.status(200).json({ message: 'All reports marked as read', affectedRows: result[0].affectedRows });
    } catch (error) {
        console.error('Error marking all reports as read:', error);
        res.status(500).json({ message: 'Error marking all reports as read' });
    }
};

export default { getReports, deleteReport, markAllAsRead };

