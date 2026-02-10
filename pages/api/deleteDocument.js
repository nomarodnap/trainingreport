import TrainingReport from '../../models/editTrainingReport';

export default async (req, res) => {
    if (req.method === 'POST') {
        try {
            const { id, field } = req.body;

            if (!id || !field) {
                return res.status(400).json({ message: 'Missing id or field' });
            }

            await TrainingReport.deleteDocument(id, field);
            res.status(200).json({ message: 'Document deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Database error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
};
