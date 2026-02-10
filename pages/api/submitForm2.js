// pages/api/submitForm2.js
import TrainingReport from '../../models/TrainingReport';

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { usernames, trainingData } = req.body;

      // ตรวจสอบว่ามี usernames และ trainingData หรือไม่
      if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
        return res.status(400).json({ message: 'กรุณาเพิ่มผู้ใช้อย่างน้อย 1 คน' });
      }

      if (!trainingData) {
        return res.status(400).json({ message: 'ข้อมูลการฝึกอบรมไม่ครบถ้วน' });
      }

      const results = [];
      const errors = [];

      // วนลูปส่งข้อมูลแต่ละ user
      for (const username of usernames) {
        try {
          const reportData = {
            ...trainingData,
            username: username,
          };

          // เพิ่ม submitTime เป็นเวลาปัจจุบัน
          reportData.submitTime = new Date();

          const result = await TrainingReport.addReport(reportData);
          results.push({
            username,
            success: true,
            formCode: result.formCode,
          });
        } catch (error) {
          console.error(`Error saving report for user ${username}:`, error);
          errors.push({
            username,
            success: false,
            error: error.message,
          });
        }
      }

      // ส่งผลลัพธ์กลับ
      if (errors.length === 0) {
        res.status(200).json({
          message: `บันทึกข้อมูลสำเร็จสำหรับ ${results.length} คน`,
          results,
        });
      } else if (results.length > 0) {
        res.status(207).json({
          message: `บันทึกข้อมูลสำเร็จบางส่วน: ${results.length} คนสำเร็จ, ${errors.length} คนล้มเหลว`,
          results,
          errors,
        });
      } else {
        res.status(500).json({
          message: 'การบันทึกข้อมูลล้มเหลวทั้งหมด',
          errors,
        });
      }
    } catch (error) {
      console.error('Error in submitForm2:', error);
      res.status(500).json({ message: 'Database error', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

