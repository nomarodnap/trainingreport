
import pool from '../../lib/db';

export default async function handler(req, res) {
    try {
        const [rows] = await pool.query("SHOW COLUMNS FROM training_reports LIKE 'generation'");
        if (rows.length === 0) {
            await pool.query("ALTER TABLE training_reports ADD COLUMN generation VARCHAR(50) DEFAULT 'รุ่นที่' AFTER trainingBatch");
            return res.status(200).json({ message: 'Column generation added successfully' });
        }
        return res.status(200).json({ message: 'Column generation already exists' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}
