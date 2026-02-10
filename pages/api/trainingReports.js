// pages/api/trainingReports.js
import TrainingReport from '../../models/TrainingReport';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const reports = await TrainingReport.getAllReports();
      res.status(200).json(reports);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
