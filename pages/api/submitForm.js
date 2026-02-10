// pages/api/submitForm.js
import TrainingReport from '../../models/TrainingReport';

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      const reportData = req.body;
      // เพิ่ม submitTime เป็นเวลาปัจจุบัน
      reportData.submitTime = new Date();

      await TrainingReport.addReport(reportData);
      res.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Database error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
