import pool from '../lib/db.js';
import { v4 as uuidv4 } from 'uuid';

export default class TrainingReport {

  /* ===============================
   *  Fiscal Year Helper
   * =============================== */
  static getFiscalYearCode(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-based
    const buddhistYear = (month >= 9 ? year + 1 : year) + 543;
    return String(buddhistYear).slice(-2); // เช่น 69
  }

  /* ===============================
   *  Generate formCode
   * =============================== */
  static async generateFormCode(submitTime, connection) {
    const fiscalYear = this.getFiscalYearCode(submitTime);

    const [rows] = await connection.query(
      `
      SELECT MAX(CAST(SUBSTRING(formCode, 3, 5) AS UNSIGNED)) AS maxCounter
      FROM training_reports
      WHERE SUBSTRING(formCode, 1, 2) = ?
      `,
      [fiscalYear]
    );

    const maxCounter = rows[0]?.maxCounter || 0;
    const newCounter = maxCounter + 1;
    return fiscalYear + String(newCounter).padStart(5, '0');
  }

  /* ===============================
   *  Add Report
   * =============================== */
  static async addReport(reportData) {

    const {
      username,
      trainingOrg,
      courseCode,
      courseName,
      trainingBatch,
      generation,
      trainingType,
      checked,
      period,
      trainingMethod,
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
      telephone,
      submitTime,
      knowledgeUsage,
      approvalDocument,
      trainingProjectDocument,
      certificate_url,
      note, // ✅ note
    } = reportData;

    const id = uuidv4();

    /* ---------- Validate Date ---------- */
    if (startDate && isNaN(new Date(startDate).getTime())) {
      throw new Error('Invalid startDate format');
    }
    if (endDate && isNaN(new Date(endDate).getTime())) {
      throw new Error('Invalid endDate format');
    }

    /* ---------- Fetch Course Detail ---------- */
    let courseCodeDetail = null;
    let categoryDetail = null;

    if (courseCode) {
      const [result] = await pool.query(
        'SELECT code_cou, name_cou, category FROM course1 WHERE id_macou = ?',
        [courseCode]
      );

      if (result.length > 0) {
        courseCodeDetail = `${result[0].code_cou} - ${result[0].name_cou}`;
        categoryDetail = result[0].category;
      }
    }

    /* ---------- Validate Budget Range ---------- */
    const MAX_INT = 2147483647;
    if (internalBudget > MAX_INT || externalBudget > MAX_INT || totalCost > MAX_INT) {
      throw new Error('Budget value exceeds database limit (Max: 2,147,483,647)');
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const formCode = await this.generateFormCode(
        submitTime || new Date(),
        connection
      );

      const query = `
  INSERT INTO training_reports (
    id, formCode, username, trainingOrg,
    courseCode, courseName, category, trainingBatch, generation,
    trainingType, checked, period, trainingMethod,
    startDate, endDate,
    regFeeAmount, accommodationFeeAmount, transportationFeeAmount, allowanceFeeAmount,
    internalBudget, externalBudget, externalAgency, planBudget,
    projectOutput, mainActivity, subActivity, totalCost,
    hybridLocation, telephone, submitTime, state,
    knowledgeSelfDevelop, knowledgeWorkImprove, knowledgeTeamwork,
    knowledgeEfficiency, knowledgeNetworking,
    approval_document, training_project_document, certificate_url,
    note
  ) VALUES (
  ?, ?, ?, ?,
  ?, ?, ?, ?, ?,
  ?, ?, ?, ?,
  ?, ?,
  ?, ?, ?, ?,
  ?, ?, ?, ?,
  ?, ?, ?, ?,
  ?, ?, ?, ?,
  ?, ?, ?, ?,
  ?, ?, ?, ?,
  ?
)

`;


      const values = [
        id,
        formCode,
        username,
        trainingOrg,
        courseCode,
        courseName,
        categoryDetail || null,
        trainingBatch || null,
        generation || null,
        trainingType || null,
        checked || 'รอตรวจสอบ',
        period || null,
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
        telephone || null,
        submitTime || new Date(),
        'รออนุมัติ',
        knowledgeUsage?.[0] || null,
        knowledgeUsage?.[1] || null,
        knowledgeUsage?.[2] || null,
        knowledgeUsage?.[3] || null,
        knowledgeUsage?.[4] || null,
        approvalDocument || null,
        trainingProjectDocument || null,
        certificate_url || null,
        note || null, // ✅ note
      ];

      await connection.query(query, values);
      await connection.commit();

      return {
        message: 'Data saved successfully',
        formCode,
      };

    } catch (error) {
      await connection.rollback();
      console.error('Database error:', error);
      throw new Error('Database operation failed');
    } finally {
      connection.release();
    }
  }

  /* ===============================
   *  Get All Reports
   * =============================== */
  static async getAllReports() {
    const [rows] = await pool.query(
      `SELECT * FROM training_reports ORDER BY submitTime DESC`
    );
    return rows;
  }
}
