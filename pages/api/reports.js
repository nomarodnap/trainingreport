// pages/api/reports.js
import reportsController from '../../controllers/reportsController';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return reportsController.getReports(req, res);
    } else if (req.method === 'DELETE') {
        return reportsController.deleteReport(req, res);
    } else {
        res.setHeader('Allow', ['GET', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
