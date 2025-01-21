// pages/api/deleteReport.js

import pool from '../../lib/db.js';

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        const { id } = req.query;
        
        try {
            const [result] = await pool.query('DELETE FROM training_reports WHERE id = ?', [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Report not found' });
            }
            res.status(200).json({ message: 'Report deleted successfully' });
        } catch (error) {
            console.error('Error deleting report:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
