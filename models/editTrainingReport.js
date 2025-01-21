import pool from '../lib/db.js';

export default class TrainingReport {
  static async updateReport(reportData) {
const {
  id,
  username,
  trainingOrg,
  courseCode,
  trainingMethod,
  startDate,
  endDate,
  regFeeAmount,
  accommodationFeeAmount,
  transportationFeeAmount,
  allowanceFeeAmount,
  internalBudget,
  externalBudget,
  externalAgency,
  planBudget,
  projectOutput,
  mainActivity,
  subActivity,
  totalCost,
  hybridLocation,
  submitTime,
  knowledgeUsage,
  certificate_url, // เพิ่ม certificate_url
} = reportData;


    // ตรวจสอบว่า id ถูกส่งมาหรือไม่
    if (!id) {
      throw new Error('ID is required for updating a report');
    }

    // ดึงข้อมูลจากตาราง course1
    let courseCodeDetail = null;
    let categoryDetail = null;
    if (courseCode) {
      try {
        const [result] = await pool.query(
          'SELECT code_cou, name_cou, category FROM course1 WHERE id_macou = ?',
          [courseCode]
        );
        if (result.length > 0) {
          courseCodeDetail = `${result[0].code_cou} - ${result[0].name_cou}`;
          categoryDetail = result[0].category;
        } else {
          console.warn(`Course with id_macou=${courseCode} not found.`);
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
        throw new Error('Failed to fetch course details');
      }
    }

const updateQuery = `
  UPDATE training_reports
  SET 
    username = ?,
    trainingOrg = ?,
    courseCode = ?,
    category = ?, -- เพิ่ม category ด้วย
    trainingMethod = ?,
    startDate = ?,
    endDate = ?,
    regFeeAmount = ?,
    accommodationFeeAmount = ?,
    transportationFeeAmount = ?,
    allowanceFeeAmount = ?,
    internalBudget = ?,
    externalBudget = ?,
    externalAgency = ?,
    planBudget = ?,
    projectOutput = ?,
    mainActivity = ?,
    subActivity = ?,
    totalCost = ?,
    hybridLocation = ?,
    submitTime = ?,
    knowledgeSelfDevelop = ?,
    knowledgeWorkImprove = ?,
    knowledgeTeamwork = ?,
    knowledgeEfficiency = ?,
    knowledgeNetworking = ?,
    certificate_url = ? -- เพิ่ม certificate_url
  WHERE id = ?
`;


const updateValues = [
  username || null,
  trainingOrg || null,
  courseCodeDetail || null, // ใช้ courseCodeDetail ที่แปลงแล้ว
  categoryDetail || null,   // ใช้ categoryDetail จาก course1
  trainingMethod || null,
  startDate || null,
  endDate || null,
  regFeeAmount || 0,
  accommodationFeeAmount || 0,
  transportationFeeAmount || 0,
  allowanceFeeAmount || 0,
  internalBudget || 0,
  externalBudget || 0,
  externalAgency || null,
  planBudget || null,
  projectOutput || null,
  mainActivity || null,
  subActivity || null,
  totalCost || 0,
  hybridLocation || null,
  submitTime || new Date(),
  knowledgeUsage?.[0] || null,
  knowledgeUsage?.[1] || null,
  knowledgeUsage?.[2] || null,
  knowledgeUsage?.[3] || null,
  knowledgeUsage?.[4] || null,
  certificate_url || null, // เพิ่ม certificate_url
  id,
];

    try {
      const [result] = await pool.query(updateQuery, updateValues);
      console.debug('Update result:', result);

      // ตรวจสอบว่ามีเรคอร์ดที่ถูกอัปเดตหรือไม่
      if (result.affectedRows === 0) {
        throw new Error(`No record found with ID: ${id}`);
      }

      console.info('Record updated successfully');
      return { message: 'Record updated successfully' };
    } catch (error) {
      console.error('Error updating record:', error);
      throw new Error('Failed to update record');
    }
  }
}
