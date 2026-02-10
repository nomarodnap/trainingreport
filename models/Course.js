// models/Course.js
import pool from '../lib/db.js';

export default class Course {
  static async getAllCourses() {
    try {
      const [rows] = await pool.query('SELECT code_cou, name_cou, category FROM course1');
      return rows;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }
}
