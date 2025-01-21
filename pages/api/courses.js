// pages/api/courses.js
import Course from '../../models/Course';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const courses = await Course.getAllCourses();
      res.status(200).json(courses);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
