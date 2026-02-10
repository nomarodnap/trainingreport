import pool from '../lib/db.js';

export default class TrainingReport {
  static async updateReport(reportData) {
    const {
      id,
      trainingOrg,
      courseCode,
      courseName,
      period,
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
      editTime,
      whoEdit,
      knowledgeUsage,
      approvalDocument,
      trainingProjectDocument,
      certificate_url,
      telephone,
    } = reportData;

    if (!id) throw new Error('ID is required for updating a report');

    try {
      // 🔹 ดึงข้อมูลเก่าจากฐานข้อมูล
      const [currentData] = await pool.query(
        `SELECT approval_document, training_project_document, certificate_url, telephone 
         FROM training_reports WHERE id = ?`,
        [id]
      );

      if (currentData.length === 0) throw new Error(`❌ No record found with ID: ${id}`);

      const existingData = currentData[0];

      // 🔹 ใช้ค่าที่มีอยู่เดิมถ้าไม่มีค่าใหม่
      const finalApprovalDocument = approvalDocument || existingData.approval_document;
      const finalTrainingProjectDocument =
        trainingProjectDocument || existingData.training_project_document;
      const finalCertificateUrl = certificate_url || existingData.certificate_url;
      const finalTelephone =
        telephone && telephone.trim() !== '' ? telephone : existingData.telephone;

      // ✅ เพิ่มส่วนนี้กลับมา
      const updateQuery = `
        UPDATE training_reports
        SET 
          trainingOrg = ?,
          courseCode = ?,
          courseName = ?,
          period = ?,
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
          telephone = ?,
          editTime = ?,
          whoEdit = ?,
          state = ?,
          knowledgeSelfDevelop = ?,
          knowledgeWorkImprove = ?,
          knowledgeTeamwork = ?,
          knowledgeEfficiency = ?,
          knowledgeNetworking = ?,
          approval_document = ?,
          training_project_document = ?,
          certificate_url = ?
        WHERE id = ?
      `;

      // 🔹 กำหนดค่าอัปเดต
      const updateValues = [
        trainingOrg,
        courseCode,
        courseName,
        period,
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
        finalTelephone,
        editTime || new Date(),
        whoEdit || null,
        'รออนุมัติ',
        knowledgeUsage?.[0] || null,
        knowledgeUsage?.[1] || null,
        knowledgeUsage?.[2] || null,
        knowledgeUsage?.[3] || null,
        knowledgeUsage?.[4] || null,
        finalApprovalDocument,
        finalTrainingProjectDocument,
        finalCertificateUrl,
        id,
      ];

      console.log('📌 updateValues:', updateValues);

      const [result] = await pool.query(updateQuery, updateValues);

      if (result.affectedRows === 0) throw new Error(`❌ No record found with ID: ${id}`);

      console.info('✅ Record updated successfully');
      return { message: 'Record updated successfully' };
    } catch (error) {
      console.error('❌ Error updating record:', error);
      throw new Error('Failed to update record');
    }
  }

  static async deleteDocument(id, field) {
    if (!id || !field) throw new Error('ID and field are present');

    const validFields = ['approval_document', 'training_project_document', 'certificate_url'];
    if (!validFields.includes(field)) {
      throw new Error('Invalid field name');
    }

    try {
      const query = `UPDATE training_reports SET ${field} = NULL WHERE id = ?`;
      const [result] = await pool.query(query, [id]);

      if (result.affectedRows === 0) throw new Error(`❌ No record found with ID: ${id}`);

      console.info(`✅ Document ${field} deleted (set to NULL) for ID: ${id}`);
      return { message: 'Document deleted successfully' };
    } catch (error) {
      console.error('❌ Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  }
}
