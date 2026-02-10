// pages/api/user/markAsSeen.js
import db from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

  const { username } = req.body
  if (!username) return res.status(400).json({ message: 'Username is required' })

  try {
    await db.execute(
      'UPDATE users SET hasSeenTour = 1 WHERE username = ?',
      [username]
    )

    return res.status(200).json({ message: 'Marked as seen' })
  } catch (err) {
    return res.status(500).json({ message: 'DB error', error: err })
  }
}
