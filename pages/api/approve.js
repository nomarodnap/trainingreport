import approveController from '../../controllers/approveController';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        return approveController.updateState(req, res);
    } else if (req.method === 'GET') {
        // ตัวอย่าง: ส่งข้อความแสดงว่า API ทำงาน
        res.status(200).json({ message: 'Approve API is working' });
    } else {
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
