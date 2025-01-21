import pool from '../../../lib/db';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { id, status } = req.body;

        if (!id || !status) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        try {
            const [result] = await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({ message: 'Status updated successfully' });
        } catch (error) {
            console.error('Error updating user status:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
