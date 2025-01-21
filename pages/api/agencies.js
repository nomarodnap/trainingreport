export default async function handler(req, res) {
  try {
  const [rows] = await pool.query('SELECT id_extage, name_extage FROM exteagency1');
  res.json(rows); // ตรวจสอบว่า rows เป็น Array

  } catch (error) {
    console.error('Error fetching agencies:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
