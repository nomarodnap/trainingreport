const deleteReport = async (req, res, id) => {
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

export default { getReports, deleteReport };
