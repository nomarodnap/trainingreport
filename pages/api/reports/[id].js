import reportsController from '../../../controllers/reportsControllerForNoti';

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method === 'GET') {
        return reportsController.getReport(req, res, id);
    } else if (req.method === 'PATCH') {
        return reportsController.markAsRead(req, res, id);
    } else {
        res.setHeader('Allow', ['GET', 'PATCH']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
