import db from './db'; // เชื่อมต่อฐานข้อมูล

export default async function handler(req, res) {
    const { id } = req.query; // ดึง id จาก URL
    const includeReports = req.query.includeReports === 'true'; // ตรวจสอบ query parameter

    if (req.method === 'GET') {
        try {
            // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
            const user = await db.getUserById(id);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // หากมีการขอรวมข้อมูลรายงานการอบรม
            if (includeReports) {
                const trainingReports = await db.getTrainingReportsByUsername(user.username);

                return res.status(200).json({
                    ...user,
                    trainingReports, // รวมข้อมูลรายงานการอบรมในผลลัพธ์
                });
            }

            // ส่งข้อมูลผู้ใช้กลับหากไม่ต้องการข้อมูลรายงาน
            return res.status(200).json(user);
        } catch (error) {
            console.error('Error fetching user or reports:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // หาก Method ไม่ใช่ GET
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
