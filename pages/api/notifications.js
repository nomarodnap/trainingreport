import reportsController from '../../controllers/reportsController';

export default async function handler(req, res) {
    const { id } = req.query; // รับ id จาก URL

    if (req.method === 'GET') {
        // เรียกใช้ฟังก์ชัน getReport จาก controller สำหรับ GET request
        return reportsController.getReports(req, res, id);
    } else if (req.method === 'PATCH') {
        // เรียกใช้ฟังก์ชัน markAsRead จาก controller สำหรับ PATCH request
        return reportsController.markAsRead(req, res, id);
    } else {
        res.setHeader('Allow', ['GET', 'PATCH']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}