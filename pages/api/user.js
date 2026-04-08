// pages/api/user.js
import db from '../../lib/db'

export default async function handler(req, res) {
  const { username } = req.query
  if (!username) return res.status(400).json({ message: 'Username is required' })

  try {
    const [rows] = await db.execute(
      'SELECT hasSeenTour FROM users WHERE username = ?',
      [username]
    )

    if (rows.length === 0) return res.status(404).json({ message: 'User not found' })

    const user = rows[0];
    const isFirstLogin = user.hasSeenTour == 0 || user.hasSeenTour === null || user.hasSeenTour === false;
    return res.status(200).json({ isFirstLogin, hasSeenTour: user.hasSeenTour })
  } catch (err) {
    return res.status(500).json({ message: 'DB error', error: err })
  }
}
