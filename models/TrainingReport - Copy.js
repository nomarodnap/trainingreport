import pool from '../lib/db.js';

export default class TrainingReport {
  static async addReport(reportData) {
    const {
      username,
      trainingOrg,
      courseCode,
      trainingMethod,
      onsiteLocation,
      hybridLocation,
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
      submitTime,
      knowledgeUsage, // ข้อมูลการนำความรู้ไปใช้ประโยชน์
      certificate_url, // URL ของใบเกียรติบัตร
    } = reportData;

    // ตรวจสอบความถูกต้องของวันที่
    console.log("Input data received:", reportData); // Debug ข้อมูลที่รับเข้ามาทั้งหมด
    if (startDate && isNaN(new Date(startDate).getTime())) {
      throw new Error('Invalid startDate format');
    }
    if (endDate && isNaN(new Date(endDate).getTime())) {
      throw new Error('Invalid endDate format');
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
        console.log("Course details fetched:", { courseCodeDetail, categoryDetail }); // Debug ข้อมูลคอร์สที่ดึงมา
      } catch (error) {
        console.error('Error fetching course details:', error);
        throw new Error('Failed to fetch course details');
      }
    }

    // SQL Query สำหรับการบันทึกข้อมูล
    const query = `
      INSERT INTO training_reports 
      (username, trainingOrg, courseCode, category, trainingMethod, startDate, endDate, regFeeAmount, accommodationFeeAmount, transportationFeeAmount, allowanceFeeAmount, internalBudget, externalBudget, externalAgency, planBudget, projectOutput, mainActivity, subActivity, totalCost, hybridLocation, submitTime, status, knowledgeSelfDevelop, knowledgeWorkImprove, knowledgeTeamwork, knowledgeEfficiency, knowledgeNetworking, certificate_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      username,
      trainingOrg,
      courseCodeDetail || null, // ใช้ courseCodeDetail จาก `course1`
      categoryDetail || null,   // ใช้ categoryDetail จาก `course1`
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
      'รออนุมัติ', // ค่า status เริ่มต้น
      knowledgeUsage?.[0] || null,
      knowledgeUsage?.[1] || null,
      knowledgeUsage?.[2] || null,
      knowledgeUsage?.[3] || null,
      knowledgeUsage?.[4] || null,
      certificate_url || null, // เพิ่ม URL ของใบเกียรติบัตร
    ];

    console.log("Values to insert into database:", values); // Debug ค่าที่จะถูกส่งเข้าไปในฐานข้อมูล

    try {
      const result = await pool.query(query, values);
      console.log("Insert result:", result); // Debug ผลลัพธ์จากการ INSERT
      return { message: 'Data saved successfully' };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Database operation failed');
    }
  }
}
