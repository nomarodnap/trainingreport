import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query(
        `SELECT id, support_id, message, isRead, created_at
         FROM notifications
         ORDER BY created_at DESC`
      );
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching support notifications:', error);
      res.status(500).json({ error: 'Error fetching support notifications' });
    }
  } else if (req.method === 'PATCH') {
    // mark ALL as read
    try {
      await pool.query('UPDATE notifications SET isRead = 1');
      res.status(200).json({ success: true, message: 'All support notifications marked as read' });
    } catch (error) {
      console.error('Error marking all support notifications:', error);
      res.status(500).json({ error: 'Error marking all as read' });
    }
  } else if (req.method === 'POST') {
    // mark as read
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing notification id' });
    try {
      await pool.query('UPDATE notifications SET isRead = 1 WHERE id = ?', [id]);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Error updating notification' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
