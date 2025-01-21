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
        trainingOrg, 
        courseCode, 
        category, 
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
        knowledgeNetworking 
      FROM training_reports 
      WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Form data not found' });
    }



    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching form data:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
}
