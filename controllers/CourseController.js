// controllers/CourseController.js
import Course from '../models/Course.js';

export const getCourses = async (req, res) => {
    if (req.method === 'GET') {
        try {
            const courses = await Course.fetchAll();
            res.status(200).json(courses);
        } catch (error) {
            console.error('Error fetching courses:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
