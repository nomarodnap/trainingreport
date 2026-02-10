// ในไฟล์ API (เช่น /api/reports/checkStatus.js)
import db from '../../../lib/db'; // หรือเส้นทางของ database connection

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { reportId, checked } = req.body;

        // ใช้ค่า checked ที่ถูกส่งมา โดยไม่ตัดทอนข้อมูล
        const newStatus = checked.startsWith('ตรวจสอบแล้ว') ? checked : 'รอตรวจสอบ';

        try {
            await db.query(
                'UPDATE training_reports SET checked = ? WHERE id = ?',
                [newStatus, reportId]
            );
            res.status(200).json({ success: true, message: 'สถานะถูกอัปเดตเรียบร้อยแล้ว' });
        } catch (error) {
            console.error('Error updating status:', error);
            res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}

