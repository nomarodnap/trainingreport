import pool from '../../lib/db';
import { parse } from 'cookie';

export default async function handler(req, res) {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS note_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reportId VARCHAR(255),
        formCode VARCHAR(50),
        note TEXT,
        isRead TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error('Error creating note_notifications table:', error);
    return res.status(500).json({ message: 'Error creating table: ' + error.message });
  }

  const cookies = parse(req.headers.cookie || '');
  const session = cookies.session;
  let username = null;
  
  if (session) {
    try {
      const parsedSession = JSON.parse(session);
      username = parsedSession.username;
    } catch (e) {}
  }

  if (!username) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  let userStatus = 'user';
  try {
     const [rows] = await pool.query('SELECT status FROM users WHERE username = ?', [username]);
     if (rows.length > 0) userStatus = rows[0].status;
  } catch (e) {}

  if (req.method === 'GET') {
    // Fetch note notifications
    try {
      let rows;
      const [userReports] = await pool.query('SELECT id FROM training_reports WHERE username = ?', [username]);
      const reportIds = userReports.map(r => r.id);

      if (reportIds.length === 0) {
        rows = [];
      } else {
        const query = `
          SELECT * FROM note_notifications 
          WHERE reportId IN (?) 
          ORDER BY created_at DESC
        `;
        [rows] = await pool.query(query, [reportIds]);
      }

      return res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching note notifications:', error);
      return res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
  } 
  
  else if (req.method === 'PATCH') {
    // Mark all as read
    try {
      const result = await pool.query("UPDATE note_notifications SET isRead = true");
      return res.status(200).json({ message: 'All note notifications marked as read' });
    } catch (error) {
      console.error('Error marking all as read:', error);
      return res.status(500).json({ message: 'Error updating notifications' });
    }
  } 
  
  else if (req.method === 'POST') {
    // Mark single as read
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: 'Missing id' });
    
    try {
      await pool.query("UPDATE note_notifications SET isRead = true WHERE id = ?", [id]);
      return res.status(200).json({ message: 'Marked as read' });
    } catch (error) {
      console.error('Error marking as read:', error);
      return res.status(500).json({ message: 'Error updating notification' });
    }
  } 
  
  else {
    res.setHeader('Allow', ['GET', 'PATCH', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
