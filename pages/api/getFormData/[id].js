import pool from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Missing id parameter' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT 
        username, 
        formCode,
        trainingOrg, 
        courseCode, 
	courseName,
        period, 
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
        state, 
        knowledgeSelfDevelop, 
        knowledgeWorkImprove, 
        knowledgeTeamwork, 
        knowledgeEfficiency, 
        knowledgeNetworking,
	approval_document,
	training_project_document,
	certificate_url,
	checked,
	telephone
      FROM training_reports 
      WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Form data not found' });
    }

    const data = rows[0];

    // แปลง internalBudget และ externalBudget ให้เป็น null หากค่าเป็น "0.00"
    data.internalBudget =
      parseFloat(data.internalBudget) === 0 ? null : data.internalBudget;
    data.externalBudget =
      parseFloat(data.externalBudget) === 0 ? null : data.externalBudget;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching form data:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
}
