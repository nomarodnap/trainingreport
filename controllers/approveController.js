import pool from '../lib/db.js';

const updateState= async (req, res) => {
    const { id, state} = req.body;

    console.log('Received data:', { id, state});

    if (!id || !state) {
        console.error('Validation error: Missing report ID or state');
        return res.status(400).json({ message: 'Missing report ID or state' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE training_reports SET state= ? WHERE id = ?',
            [state, id]
        );

        console.log('Query result:', result);

        if (result.affectedRows === 0) {
            console.error('Error: Report not found');
            return res.status(404).json({ message: 'Report not found' });
        }

        res.status(200).json({ message: `Report updated to ${state}` });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Error updating report state' });
    }
};



export default { updateState};
