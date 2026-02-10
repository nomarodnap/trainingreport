import db from '../../../lib/db'; // เชื่อมต่อฐานข้อมูล (คุณอาจต้องปรับตามโปรเจกต์ของคุณ)

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method === 'PATCH') {
        try {
            // อัปเดตสถานะ Notification ในฐานข้อมูล
            await db.notification.update({
                where: { id },
                data: { isRead: true },
            });

            res.status(200).json({ success: true, message: 'Notification updated' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.setHeader('Allow', ['PATCH']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
